import importlib, traceback
try:
    importlib.import_module('src.main')
    print('IMPORT_OK')
except Exception:
    traceback.print_exc()
    print('IMPORT_FAIL')

