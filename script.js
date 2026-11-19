(() => {
  const profile = window.PROFILE || {};
  const sites = (window.SITES || []).filter((s) => s && s.title && s.url);
  const $ = (id) => document.getElementById(id);

  // Build elements with textContent only, so text in sites.js can never inject HTML.
  const el = (tag, props = {}, children = []) => {
    const { ariaLabel, ...rest } = props;
    const node = Object.assign(document.createElement(tag), rest);
    if (ariaLabel) node.setAttribute("aria-label", ariaLabel);
    for (const child of [].concat(children)) if (child) node.append(child);
    return node;
  };
  const safeUrl = (url) => {
    try {
      const u = new URL(url, location.href);
      return ["http:", "https:"].includes(u.protocol) || u.origin === location.origin ? u.href : null;
    } catch { return null; }
  };
  const external = (href, text, className) =>
    el("a", { href, textContent: text, className, target: "_blank", rel: "noopener noreferrer" });

  // Profile
  document.title = profile.name ? `${profile.name} · Portfolio` : "Portfolio";
  $("name").textContent = profile.name || "My Portfolio";
  $("role").textContent = profile.role || "";
  $("intro").textContent = profile.intro || "";
  $("footer-name").textContent = profile.name || "";
  $("year").textContent = new Date().getFullYear();
  const photo = profile.photo && safeUrl(profile.photo);
  if (photo) {
    $("photo").src = photo;
    $("photo").alt = profile.name ? `Portrait of ${profile.name}` : "Portrait";
    $("photo").onerror = () => { $("photo").hidden = true; };
    $("photo").hidden = false;
  }
  if (profile.status) {
    $("status").textContent = profile.status;
    $("status").hidden = false;
  }
  // Brand logos (Simple Icons paths, 24×24), drawn in the current text color.
  const ICONS = {
    github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  };
  const icon = (name) => {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", ICONS[name]);
    path.setAttribute("fill", "currentColor");
    svg.append(path);
    return svg;
  };

  for (const link of profile.links || []) {
    const href = safeUrl(link.url);
    if (!href) continue;
    const a = external(href, "");
    const name = (link.icon || "").toLowerCase();
    if (ICONS[name]) {
      a.classList.add("has-icon", `icon-${name}`);
      a.append(icon(name));
    }
    a.append(el("span", { textContent: link.label }));
    $("profile-links").append(a);
  }

  // About section (hidden when there is nothing to show)
  const about = (profile.about || []).filter(Boolean);
  const expertise = (profile.expertise || []).filter(Boolean);
  if (about.length || expertise.length) {
    $("about").hidden = false;
    $("about-body").replaceChildren(...about.map((p) => el("p", { textContent: p })));
    if (expertise.length) {
      $("expertise-box").hidden = false;
      $("expertise-title").textContent = profile.expertiseTitle || "Areas of expertise";
      $("expertise").replaceChildren(...expertise.map((t) => el("li", { textContent: t })));
    }
  }

  // AWS experience section
  const aws = profile.aws;
  const groups = (aws?.groups || []).filter((g) => g && g.name);
  if (groups.length) {
    $("aws").hidden = false;
    $("aws-heading").textContent = aws.title || "AWS experience";
    $("aws-intro").textContent = aws.intro || "";
    $("aws-intro").hidden = !aws.intro;
    $("aws-grid").replaceChildren(...groups.map((g) =>
      el("li", { className: "aws-card" }, [
        el("h3", { textContent: g.name }),
        g.services?.length
          ? el("ul", { className: "tags", ariaLabel: "AWS services" },
              g.services.map((s) => el("li", { textContent: s })))
          : null,
        g.detail ? el("p", { textContent: g.detail }) : null,
      ])));
  }

  // Placeholder thumbnail: a gradient picked from the title, with initials.
  const hue = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  const initials = (text) =>
    text.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  const card = (site) => {
    const href = safeUrl(site.url);
    if (!href) return null;
    const host = new URL(href).hostname.replace(/^www\./, "");

    const thumb = el("div", { className: "thumb" });
    const h = hue(site.title);
    const placeholder = () => {
      thumb.replaceChildren(initials(site.title));
      thumb.style.background = `linear-gradient(135deg, hsl(${h} 70% 52%), hsl(${(h + 50) % 360} 75% 42%))`;
    };
    const img = site.image && safeUrl(site.image);
    if (img) {
      thumb.append(el("img", { src: img, alt: "", loading: "lazy", onerror: placeholder }));
    } else {
      placeholder();
    }

    const actions = el("div", { className: "actions" }, [
      external(href, "Visit site ↗", "btn primary"),
      site.code && safeUrl(site.code) ? external(safeUrl(site.code), "Code", "btn") : null,
    ]);

    return el("li", { className: "card" }, [
      site.featured ? el("span", { className: "badge", textContent: "Featured" }) : null,
      thumb,
      el("div", { className: "body" }, [
        el("h3", {}, external(href, site.title)),
        el("p", { className: "host", textContent: host }),
        site.description ? el("p", { className: "desc", textContent: site.description }) : null,
        site.tags?.length
          ? el("ul", { className: "tags", ariaLabel: "Technologies" },
              site.tags.map((t) => el("li", { textContent: t })))
          : null,
        actions,
      ]),
    ]);
  };

  // Featured first, then in file order.
  const ordered = sites
    .map((s, i) => ({ s, i }))
    .sort((a, b) => (b.s.featured ? 1 : 0) - (a.s.featured ? 1 : 0) || a.i - b.i)
    .map(({ s }) => s);

  // Filters: only shown when there is something to filter.
  const allTags = [...new Set(ordered.flatMap((s) => s.tags || []))].sort((a, b) => a.localeCompare(b));
  let active = "All";

  const render = () => {
    const shown = ordered.filter((s) => active === "All" || (s.tags || []).includes(active));
    $("grid").replaceChildren(...shown.map(card).filter(Boolean));
    $("count").textContent = `(${shown.length})`;
    $("empty").hidden = shown.length > 0;
    for (const b of $("filters").children) b.setAttribute("aria-pressed", String(b.dataset.tag === active));
  };

  if (ordered.length > 1 && allTags.length > 1) {
    for (const tag of ["All", ...allTags]) {
      const b = el("button", { type: "button", textContent: tag });
      b.dataset.tag = tag;
      b.addEventListener("click", () => { active = tag; render(); });
      $("filters").append(b);
    }
  }

  render();
})();
