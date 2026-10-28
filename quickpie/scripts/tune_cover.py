import pathlib
p = pathlib.Path("scripts/make_cover.py")
s = p.read_text(encoding="utf-8")
s = s.replace("R_IN, R_OUT = 190, 430", "R_IN, R_OUT = 168, 430")
s = s.replace("left: {CX - 128}px; top: {CY - 128}px; width: 256px; height: 256px;",
              "left: {CX - 106}px; top: {CY - 106}px; width: 212px; height: 212px;")
s = s.replace(".hub img {{ width: 132px; height: 132px; border-radius: 26px; }}",
              ".hub img {{ width: 112px; height: 112px; border-radius: 24px; }}")
p.write_text(s, encoding="utf-8")
print("tuned")
