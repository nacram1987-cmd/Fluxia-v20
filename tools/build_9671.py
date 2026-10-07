from pathlib import Path\n# trigger v96.71 build
import subprocess,re,json,hashlib
FAST=Path("index_fluxia_v96.67_LAB.html"); DST=Path("index_fluxia_v96.71_LAB.html")