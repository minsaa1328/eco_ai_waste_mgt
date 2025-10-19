# Quick import test for the backend app
import sys
try:
    import src.main
    print('IMPORT_OK')
except Exception:
    import traceback
    traceback.print_exc()
    sys.exit(1)

