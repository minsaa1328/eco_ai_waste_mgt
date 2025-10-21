import os
import jwt
import requests
from fastapi import HTTPException, Header
from dotenv import load_dotenv

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_ISSUER = "https://decent-mutt-59.clerk.accounts.dev"


async def verify_clerk_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    token = authorization.split("Bearer ")[-1].strip()

    try:
        # Get the JWKS public key from Clerk
        jwks_url = f"{CLERK_ISSUER}/.well-known/jwks.json"
        jwks_response = requests.get(jwks_url)
        jwks_response.raise_for_status()
        jwks = jwks_response.json()

        # Get the unverified header to find the key ID
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')

        # Find the correct key from JWKS
        key = None
        for jwk in jwks['keys']:
            if jwk['kid'] == kid:
                key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                break

        if not key:
            raise HTTPException(status_code=401, detail="Invalid token key")

        # Verify the token WITHOUT audience validation
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_aud": False}  # Skip audience verification
        )

        user_id = payload.get("sub")
        print(f"✅ Clerk user verified: {user_id}")

        return {"id": user_id, "email": payload.get("email")}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print(f"❌ JWT validation failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"❌ Clerk verification failed: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")