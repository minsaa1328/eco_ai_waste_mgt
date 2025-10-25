import asyncio
import sys
import os
import traceback

# Ensure backend package is importable
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src.utils import auth
import jwt

async def main():
    test_token = 'invalid_token'
    try:
        print('STEP 1: try jwt.get_unverified_header')
        try:
            header = jwt.get_unverified_header(test_token)
            print('header:', header)
        except Exception as e:
            print('get_unverified_header raised:', repr(e))

        print('\nSTEP 2: try jwt.decode (no verify)')
        try:
            claims = jwt.decode(test_token, options={'verify_signature': False})
            print('claims:', claims)
        except Exception as e:
            print('jwt.decode (no verify) raised:', repr(e))

        print('\nSTEP 3: call verify_clerk_token')
        try:
            res = await auth.verify_clerk_token(f'Bearer {test_token}')
            print('verify_clerk_token result:', res)
        except Exception as e:
            print('verify_clerk_token raised:')
            traceback.print_exc()
    except Exception:
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())
