"""Record the homepage 3D scene frame by frame (deterministic time, waits for tiles), canvas only. See README.md.
usage: record-hero.py OUTDIR FPS [START_S END_S]   env: REC_W, REC_H, REC_URL
"""
import base64, json, os, subprocess, sys, time, urllib.request, websocket

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
out, fps = sys.argv[1], float(sys.argv[2])
W, H = int(os.environ.get("REC_W", 1920)), int(os.environ.get("REC_H", 1080))
URL = os.environ.get("REC_URL", "http://localhost:5180/?theme=pv&place=polyu&hud=0&lang=en&dim=0.15&shift=0.18")
os.makedirs(out, exist_ok=True)
port = 9341
proc = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={port}", f"--user-data-dir={out}/.prof",
                         f"--window-size={W},{H}", "--hide-scrollbars", "--mute-audio", "--no-first-run",
                         "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try:
            page = next(t for t in json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json")) if t["type"] == "page"); break
        except Exception:
            time.sleep(.2)
    ws = websocket.create_connection(page["webSocketDebuggerUrl"], max_size=2**28)
    n = [0]
    def call(method, **params):
        n[0] += 1; i = n[0]
        ws.send(json.dumps({"id": i, "method": method, "params": params}))
        while True:
            m = json.loads(ws.recv())
            if m.get("id") == i:
                if "error" in m: raise RuntimeError(m["error"])
                return m.get("result", {})
    def js(expr):
        r = call("Runtime.evaluate", expression=expr, awaitPromise=True, returnByValue=True)
        if "exceptionDetails" in r: raise RuntimeError(r["exceptionDetails"])
        return r.get("result", {}).get("value")
    call("Page.enable")
    call("Emulation.setDeviceMetricsOverride", width=W, height=H, deviceScaleFactor=1, mobile=False)
    call("Page.navigate", url=URL)
    for _ in range(240):
        if js("!!(window.__scene && document.body.classList.contains('ready'))"): break
        time.sleep(.5)
    total = js("""(() => {
      const s = window.__scene, acts = s.theme.acts;
      s.control.setPaused(true);
      const starts = []; let acc = 0; for (const a of acts) { starts.push(acc); acc += a.dur; }
      const total = acc;
      const locate = t => { t = ((t % total) + total) % total; let i = acts.length - 1; while (starts[i] > t) i--;
        return { i, p: (t - starts[i]) / acts[i].dur, t, act: acts[i] }; };
      const busy = () => { const st = s.tiles.stats; return st.queued + st.downloading + st.parsing; };
      const draw = t => { s.instance.update(locate(t), t); s.camera.updateMatrixWorld(); s.tiles.update(); s.renderer.render(s.scene, s.camera); };
      window.__frame = async (t, maxWait) => {
        draw(t);
        for (let k = 0; k < maxWait && busy() > 0; k++) { await new Promise(r => setTimeout(r, 40)); draw(t); }
        draw(t);
        return s.renderer.domElement.toDataURL('image/jpeg', 0.95).split(',')[1];
      };
      window.__acts = acts.map((a, i) => ({ key: a.key, start: starts[i], dur: a.dur, title: a.title, step: a.step }));
      return total;
    })()""")
    acts = js("window.__acts")
    json.dump({"total": total, "acts": acts, "fps": fps, "width": W, "height": H}, open(os.path.join(out, "acts.json"), "w"), ensure_ascii=False, indent=1)
    start = float(sys.argv[3]) if len(sys.argv) > 3 else 0
    end = float(sys.argv[4]) if len(sys.argv) > 4 else total
    # Warm up: let the first view's tiles load fully.
    js(f"__frame({start}, 400)")
    first, last = round(start * fps), round(end * fps)
    t0 = time.time()
    for k in range(first, last):
        data = js(f"__frame({k / fps}, 150)")
        open(os.path.join(out, f"f{k:05d}.jpg"), "wb").write(base64.b64decode(data))
        if k % 100 == 0: print(f"frame {k}/{last} {time.time() - t0:.0f}s", flush=True)
    print("done", last - first, "frames", f"{time.time() - t0:.0f}s")
finally:
    proc.terminate()
