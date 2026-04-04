// NOIR Food Delivery – Login Screen
// Figma Plugin: Run Once

async function build() {
  const fonts = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "SemiBold" },
    { family: "Inter", style: "Light" },
  ];
  await Promise.all(fonts.map(f => figma.loadFontAsync(f)));

  // ── Helpers ────────────────────────────────────────────────────────────────
  const rgb = (r, g, b) => ({ r: r / 255, g: g / 255, b: b / 255 });
  const fill = (r, g, b, a = 1) => [{ type: "SOLID", color: rgb(r, g, b), opacity: a }];

  function txt(chars, size, style, col, lsp = 0) {
    const t = figma.createText();
    t.fontName = { family: "Inter", style };
    t.fontSize = size;
    t.characters = chars;
    t.fills = fill(...col);
    if (lsp) t.letterSpacing = { value: lsp, unit: "PIXELS" };
    return t;
  }

  function rect(w, h, r, fills, strokes = []) {
    const n = figma.createRectangle();
    n.resize(w, h);
    n.cornerRadius = r;
    n.fills = fills;
    if (strokes.length) { n.strokes = strokes; n.strokeWeight = 1; n.strokeAlign = "INSIDE"; }
    return n;
  }

  function hline(w, col) {
    const l = figma.createLine();
    l.resize(w, 0);
    l.strokes = fill(...col);
    l.strokeWeight = 1;
    return l;
  }

  function frame(w, h, r, fills) {
    const f = figma.createFrame();
    f.resize(w, h);
    f.cornerRadius = r;
    f.fills = fills;
    f.clipsContent = true;
    return f;
  }

  function place(node, x, y) { node.x = x; node.y = y; return node; }
  function add(parent, ...children) { children.forEach(c => parent.appendChild(c)); }

  // ── Canvas ─────────────────────────────────────────────────────────────────
  const page = figma.currentPage;
  page.name = "NOIR Login";

  const canvas = frame(640, 960, 0, fill(236, 236, 234));
  canvas.name = "Canvas";
  page.appendChild(canvas);

  // ── iPhone 17 Pro Frame ────────────────────────────────────────────────────
  const PHONE_W = 393, PHONE_H = 852;
  const px = (640 - PHONE_W) / 2, py = (960 - PHONE_H) / 2;

  const phone = frame(PHONE_W, PHONE_H, 56, fill(28, 28, 30));
  phone.name = "iPhone 17 Pro";
  phone.effects = [{
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 0.45 },
    offset: { x: 0, y: 40 },
    radius: 80,
    spread: -10,
    visible: true,
    blendMode: "NORMAL",
  }];
  place(phone, px, py);
  canvas.appendChild(phone);

  // Side buttons
  const volMute = rect(3, 22, 1.5, fill(40, 40, 42));
  const volUp   = rect(3, 34, 1.5, fill(40, 40, 42));
  const volDown = rect(3, 34, 1.5, fill(40, 40, 42));
  const power   = rect(3, 68, 1.5, fill(40, 40, 42));
  place(volMute, -3, 112); place(volUp, -3, 144); place(volDown, -3, 190); place(power, PHONE_W, 168);
  add(phone, volMute, volUp, volDown, power);

  // ── Screen ─────────────────────────────────────────────────────────────────
  const SCR_W = 387, SCR_H = 846;
  const scr = frame(SCR_W, SCR_H, 53, fill(255, 255, 255));
  scr.name = "Screen";
  place(scr, 3, 3);
  phone.appendChild(scr);

  // ── Dynamic Island ─────────────────────────────────────────────────────────
  const island = rect(124, 36, 20, fill(10, 10, 10));
  island.name = "Dynamic Island";
  place(island, (SCR_W - 124) / 2, 13);
  scr.appendChild(island);

  // ── Status Bar ─────────────────────────────────────────────────────────────
  const statusTime = txt("9:41", 15, "SemiBold", [10, 10, 10]);
  place(statusTime, 28, 36);
  scr.appendChild(statusTime);

  // ── Login Content ──────────────────────────────────────────────────────────
  const PAD = 32;
  let y = 72;

  // Logo mark
  const logoBox = rect(56, 56, 16, fill(10, 10, 10));
  logoBox.name = "Logo";
  place(logoBox, PAD, y);
  scr.appendChild(logoBox);

  // Fork & knife vectors inside logo
  const forkL = figma.createVector();
  forkL.vectorNetwork = {
    vertices: [
      { x: 9, y: 4 }, { x: 9, y: 12 }, { x: 9, y: 12 }, { x: 9, y: 26 },
      { x: 7, y: 4 }, { x: 7, y: 9 },  { x: 11, y: 4 }, { x: 11, y: 9 },
    ],
    segments: [
      { start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } },
      { start: 2, end: 3, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } },
      { start: 4, end: 5, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } },
      { start: 6, end: 7, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } },
    ],
    regions: []
  };
  forkL.strokes = fill(255, 255, 255);
  forkL.strokeWeight = 1.6;
  forkL.strokeCap = "ROUND";
  forkL.fills = [];
  place(forkL, PAD + 14, y + 15);
  scr.appendChild(forkL);

  y += 56 + 22;

  // App name
  const appName = txt("NOIR", 48, "Light", [10, 10, 10], 10);
  place(appName, PAD, y);
  scr.appendChild(appName);
  y += 56 + 6;

  // Tagline
  const tagline = txt("FINE DINING, DELIVERED.", 10, "Medium", [170, 170, 170], 2.5);
  place(tagline, PAD, y);
  scr.appendChild(tagline);
  y += 14 + 44;

  // ── Email field ────────────────────────────────────────────────────────────
  const emailLbl = txt("EMAIL ADDRESS", 9.5, "Medium", [170, 170, 170], 2.5);
  place(emailLbl, PAD, y);
  scr.appendChild(emailLbl);
  y += 13 + 9;

  const emailVal = txt("you@example.com", 15, "Regular", [208, 208, 208]);
  place(emailVal, PAD, y);
  scr.appendChild(emailVal);
  y += 22;

  const emailLine = hline(SCR_W - PAD * 2, [232, 232, 232]);
  place(emailLine, PAD, y);
  scr.appendChild(emailLine);
  y += 1 + 22;

  // ── Password field ─────────────────────────────────────────────────────────
  const pwdLbl = txt("PASSWORD", 9.5, "Medium", [170, 170, 170], 2.5);
  place(pwdLbl, PAD, y);
  scr.appendChild(pwdLbl);
  y += 13 + 9;

  const pwdVal = txt("••••••••", 15, "Regular", [208, 208, 208]);
  place(pwdVal, PAD, y);
  scr.appendChild(pwdVal);
  y += 22;

  const pwdLine = hline(SCR_W - PAD * 2, [232, 232, 232]);
  place(pwdLine, PAD, y);
  scr.appendChild(pwdLine);
  y += 1 + 10;

  // Forgot password
  const forgot = txt("Forgot password?", 11, "Regular", [170, 170, 170]);
  forgot.textAlignHorizontal = "RIGHT";
  const forgotW = 120;
  place(forgot, SCR_W - PAD - forgotW, y);
  scr.appendChild(forgot);
  y += 16 + 30;

  // ── Login Button ───────────────────────────────────────────────────────────
  const BTN_W = SCR_W - PAD * 2;
  const btnBg = rect(BTN_W, 54, 16, fill(10, 10, 10));
  btnBg.name = "Login Button";
  place(btnBg, PAD, y);
  scr.appendChild(btnBg);

  const btnTxt = txt("SIGN IN", 11.5, "Medium", [255, 255, 255], 3);
  btnTxt.textAlignHorizontal = "CENTER";
  btnTxt.resize(BTN_W, 20);
  place(btnTxt, PAD, y + 17);
  scr.appendChild(btnTxt);
  y += 54 + 28;

  // ── Divider ────────────────────────────────────────────────────────────────
  const DIV_LINE_W = 92;
  const dl1 = hline(DIV_LINE_W, [232, 232, 232]);
  place(dl1, PAD, y + 8);
  scr.appendChild(dl1);

  const divTxt = txt("or continue with", 10, "Regular", [196, 196, 196], 1);
  place(divTxt, PAD + DIV_LINE_W + 10, y);
  scr.appendChild(divTxt);

  const dl2 = hline(DIV_LINE_W, [232, 232, 232]);
  place(dl2, SCR_W - PAD - DIV_LINE_W, y + 8);
  scr.appendChild(dl2);
  y += 18 + 18;

  // ── Social Buttons ─────────────────────────────────────────────────────────
  const SOC_W = (BTN_W - 12) / 2;
  const gBtn = rect(SOC_W, 50, 14, fill(255, 255, 255), fill(232, 232, 232));
  gBtn.name = "Google";
  place(gBtn, PAD, y);
  scr.appendChild(gBtn);

  const gTxt = txt("G  Google", 12.5, "Regular", [10, 10, 10]);
  place(gTxt, PAD + 22, y + 16);
  scr.appendChild(gTxt);

  const aBtn = rect(SOC_W, 50, 14, fill(255, 255, 255), fill(232, 232, 232));
  aBtn.name = "Apple";
  place(aBtn, PAD + SOC_W + 12, y);
  scr.appendChild(aBtn);

  const aTxt = txt("  Apple", 12.5, "Regular", [10, 10, 10]);
  place(aTxt, PAD + SOC_W + 12 + 22, y + 16);
  scr.appendChild(aTxt);
  y += 50 + 34;

  // ── Sign up ────────────────────────────────────────────────────────────────
  const signupT = txt("New to NOIR?  Create account", 12.5, "Regular", [150, 150, 150]);
  signupT.textAlignHorizontal = "CENTER";
  signupT.resize(BTN_W, 20);
  place(signupT, PAD, y);
  scr.appendChild(signupT);

  // ── Home Indicator ─────────────────────────────────────────────────────────
  const homeInd = rect(128, 5, 3, fill(10, 10, 10));
  homeInd.opacity = 0.18;
  homeInd.name = "Home Indicator";
  place(homeInd, (SCR_W - 128) / 2, SCR_H - 18);
  scr.appendChild(homeInd);

  // ── Viewport ───────────────────────────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView([canvas]);
  figma.closePlugin("✓ NOIR login screen created");
}

build().catch(err => figma.closePlugin("Error: " + err.message));
