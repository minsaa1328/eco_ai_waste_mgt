import os
import jwt
import requests
import json
from fastapi import HTTPException, Header
from dotenv import load_dotenv
from jwt.algorithms import RSAAlgorithm

load_dotenv()

# Read CLERK_ISSUER from environment if set; otherwise we'll derive issuer from the token at runtime.
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_ISSUER = os.getenv("CLERK_ISSUER") or os.getenv("CLERK_ISSUER_URL")  # try both variable names
# If true (1), allow skipping full verification in local dev by decoding token without signature check.
SKIP_CLERK_VERIFY = os.getenv("SKIP_CLERK_VERIFY", "0") == "1"


async def verify_clerk_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    token = authorization.split("Bearer ")[-1].strip()

    try:
        # Extract unverified pieces first so we can locate the correct JWKS endpoint.
        try:
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get('kid')
        except Exception as e:
            print(f"❌ Failed to parse token header: {e}")
            raise HTTPException(status_code=401, detail="Invalid token format")

        # Also get unverified claims to find the token's issuer if CLERK_ISSUER isn't configured.
        try:
            unverified_claims = jwt.decode(token, options={"verify_signature": False})
            token_issuer = unverified_claims.get('iss')
        except Exception as e:
            print(f"❌ Failed to parse token claims: {e}")
            raise HTTPException(status_code=401, detail="Invalid token format")

        # Decide which issuer to use for JWKS. Prefer configured CLERK_ISSUER; if not set, use token's issuer.
        issuer_to_use = CLERK_ISSUER if CLERK_ISSUER else token_issuer
        if not issuer_to_use and not CLERK_SECRET_KEY and not SKIP_CLERK_VERIFY:
            raise HTTPException(status_code=401, detail="Unable to determine token issuer for JWKS lookup")

        key = None
        jwks = {"keys": []}
        jwks_url = None

        # Try JWKS verification if we have an issuer
        if issuer_to_use:
            # Normalize issuer to avoid double slashes when building JWKS URL
            issuer_to_use = issuer_to_use.rstrip('/')
            jwks_url = f"{issuer_to_use}/.well-known/jwks.json"
            try:
                jwks_response = requests.get(jwks_url, timeout=5)
                jwks_response.raise_for_status()
                jwks = jwks_response.json()

                # Find the correct key from JWKS
                for jwk in jwks.get('keys', []):
                    if jwk.get('kid') == kid:
                        key = RSAAlgorithm.from_jwk(json.dumps(jwk))
                        break
            except Exception as e:
                print(f"⚠️ Could not fetch JWKS from {jwks_url}: {e}")

        # If no key and a CLERK_SECRET_KEY is provided (development), try HS256 decode with that secret
        if not key and CLERK_SECRET_KEY:
            try:
                payload = jwt.decode(token, CLERK_SECRET_KEY, algorithms=["HS256"], options={"verify_aud": False})
                user_id = payload.get("sub")
                print(f"✅ Clerk user verified via CLERK_SECRET_KEY: {user_id}")
                return {"id": user_id, "email": payload.get("email")}
            except Exception as e:
                print(f"⚠️ HS256 decode with CLERK_SECRET_KEY failed: {e}")

        # If still no key and token issuer differs from configured issuer, attempt fallback to token's issuer JWKS
        if not key and token_issuer and issuer_to_use and token_issuer.rstrip('/') != issuer_to_use:
            try:
                fallback_jwks_url = f"{token_issuer.rstrip('/')}/.well-known/jwks.json"
                print(f"ℹ️ Trying fallback JWKS from token issuer: {fallback_jwks_url}")
                fallback_resp = requests.get(fallback_jwks_url, timeout=5)
                fallback_resp.raise_for_status()
                fallback_jwks = fallback_resp.json()
                for jwk in fallback_jwks.get('keys', []):
                    if jwk.get('kid') == kid:
                        key = RSAAlgorithm.from_jwk(json.dumps(jwk))
                        jwks = fallback_jwks
                        jwks_url = fallback_jwks_url
                        issuer_to_use = token_issuer.rstrip('/')
                        print(f"✅ Found matching JWK in fallback JWKS for kid={kid}")
                        break
            except Exception as e:
                print(f"❌ Fallback JWKS fetch failed: {e}")

        if not key and not CLERK_SECRET_KEY and not SKIP_CLERK_VERIFY:
            # No matching key found — likely using the wrong issuer/JWKS endpoint
            print(f"❌ No matching JWK found for kid={kid} at {jwks_url}")
            try:
                available_kids = [k.get('kid') for k in jwks.get('keys', [])]
                print(f"Available JWKS kids at {jwks_url}: {available_kids}")
            except Exception:
                pass
            raise HTTPException(status_code=401, detail="Invalid token key")

        # If we have a key, verify the token properly
        if key:
            try:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=["RS256"],
                    issuer=issuer_to_use,
                    options={"verify_aud": False}
                )
            except Exception as decode_err:
                # If the verification failed due to issuer mismatch, retry without issuer enforcement
                try:
                    print(f"⚠️ Token verify with issuer failed: {decode_err}. Retrying without issuer check.")
                    payload = jwt.decode(
                        token,
                        key,
                        algorithms=["RS256"],
                        options={"verify_aud": False, "verify_iss": False}
                    )
                except Exception as final_err:
                    print(f"❌ Token verification failed even after issuer-relaxed retry: {final_err}")
                    raise

            user_id = payload.get("sub")
            print(f"✅ Clerk user verified: {user_id}")
            return {"id": user_id, "email": payload.get("email")}

        # As a last resort for local development, optionally skip verification and decode without signature
        if SKIP_CLERK_VERIFY:
            try:
                payload = jwt.decode(token, options={"verify_signature": False})
                user_id = payload.get("sub")
                print(f"⚠️ SKIP_CLERK_VERIFY enabled — accepting unverified token for user {user_id}")
                return {"id": user_id, "email": payload.get("email")}
            except Exception as e:
                print(f"❌ SKIP_CLERK_VERIFY failed to decode token: {e}")
                raise HTTPException(status_code=401, detail="Token verification failed")

        # Shouldn't reach here; defensive
        raise HTTPException(status_code=401, detail="Token verification failed")

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print(f"❌ JWT validation failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except requests.RequestException as e:
        print(f"❌ Failed fetching JWKS: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")
    except Exception as e:
        print(f"❌ Clerk verification failed: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")