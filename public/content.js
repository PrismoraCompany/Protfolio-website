/* ===== PrismoraWebs — default content =====
   Every line of text on the site lives here. Edit, commit, push -> Cloudflare redeploys.
   Text saved from the admin panel (/control-of-the-website) is stored in Cloudflare KV and overrides these defaults. */
window.PW_DEFAULTS = {
  meta: {
    brand: "PrismoraWebs",
    loaderText: "PRISMORA",
    logoText: "PRISMORA",
    contactEmail: "prismorawebs@gmail.com",
    siteUrl: "https://prismora.space",
    pageTitle: "PrismoraWebs — Websites that stand out",
    description: "PrismoraWebs is a three-person web studio: planning, development and marketing for websites that stand out from the crowd."
  },
  nav: { home: "HOME", about: "ABOUT US", doors: "WORK", experience: "JOURNEY", showcase: "WEBSITES", services: "SERVICES" },
  social: { instagram: "https://instagram.com", twitter: "https://x.com", linkedin: "https://linkedin.com", github: "https://github.com" },
  hero: {
    line1: "EXPLORE OUR",
    line2: "PORTFOLIO",
    est: "AGENCY EST. 2025",
    blurb: "WE ARE PASSIONATE ABOUT CREATING WEBSITES THAT STAND OUT FROM THE CROWD",
    tags: ["UI/UX", "WEB DESIGN", "LANDING PAGE"],
    bgColor: "#e9e8e4",
    bgColor2: "",
    bgImage: "",
    bgOverlay: "0",
    textTheme: "dark",
    showSilhouette: "yes",
    personImage: "/hero-team.webp",
    personRatio: "1.79",
    people: [
      { name: "ARMAN ALAM", role: "PLANNER / FOUNDER", desc: "Plans every project from first idea to launch day.", x: "24.4", top: "15", left: "7.7", right: "35" },
      { name: "PRINCE GHOSH", role: "MARKETER / C.E.O", desc: "Leads growth, clients and the direction of the studio.", x: "50.6", top: "0", left: "35", right: "65" },
      { name: "NILADRI YADAV", role: "DEVELOPER / FOUNDER", desc: "Builds fast, secure and beautiful websites.", x: "77.5", top: "13", left: "65", right: "93.3" }
    ]
  },
  about: {
    title1: "ABOUT",
    title2: "US",
    label: "WHO WE ARE",
    meta: "PLANNING / WEB DESIGN / DEVELOPMENT / MARKETING",
    text: "We are PrismoraWebs, a web studio of three people. Arman plans every project, Niladri builds it and Prince makes sure people find it. We design and build fast, secure websites for businesses, and we handle the SEO and marketing after launch.",
    team: [
      { name: "ARMAN ALAM", role: "PLANNER / FOUNDER", photo: "" },
      { name: "NILADRI YADAV", role: "DEVELOPER / FOUNDER", photo: "" },
      { name: "PRINCE GHOSH", role: "MARKETER / C.E.O", photo: "" }
    ],
    spotlightImage: "",
    primaryButton: "GET IN TOUCH",
    secondaryButton: "SERVICES"
  },
  experience: {
    eyebrow: "ORIGIN & FOUNDATIONS",
    title1: "WHERE",
    title2: "WE'VE BEEN",
    intro: "How PrismoraWebs started and where we are now.",
    items: [
      {
        tab: "FOUNDATION", chip: "FOUNDATIONAL CHAPTER", dates: "2025 — 2025", ghost: "CREATIVE STUDIO",
        title1: "CREATIVE", title2: "STUDIO",
        text: "Three founders joined forces to build great websites for growing businesses — planning, development and marketing under one roof.",
        milestones: [
          { label: "MILESTONE 01", text: "Defined the studio's process from idea to launch." },
          { label: "MILESTONE 02", text: "Mastered modern front-end and back-end tooling." },
          { label: "MILESTONE 03", text: "Put the process to work on real projects." }
        ]
      },
      {
        tab: "CLIENTS", chip: "CLIENT WORK", dates: "2025 — 2026", ghost: "CLIENT PROJECTS",
        title1: "FIRST", title2: "CLIENTS",
        text: "Delivered websites end-to-end for businesses of different sizes, learning what makes a site both beautiful and effective.",
        milestones: [
          { label: "DELIVERY", text: "Shipped live websites, including SlayerNodes." },
          { label: "PROCESS", text: "Built a repeatable design, code and growth workflow." },
          { label: "RESULT", text: "Faster sites, clearer messaging, more enquiries." }
        ]
      },
      {
        tab: "TODAY", chip: "PRESENT", dates: "2026 — PRESENT", ghost: "SCALING UP",
        title1: "SCALING", title2: "THE STUDIO",
        text: "Today we take on new websites, redesigns and long-term partnerships for brands that want to stand out.",
        milestones: [
          { label: "FOCUS", text: "Premium landing pages and interactive front-ends." },
          { label: "STACK", text: "Modern, fast, secure and easy to maintain." },
          { label: "GOAL", text: "Your next big idea, launched properly." }
        ]
      }
    ]
  },
  services: {
    title: "THE SERVICES WE PROVIDE",
    subtitle: "CREATING VISUALLY APPEALING AND FUNCTIONAL WEBSITES TAILORED TO THE CLIENT'S NEEDS AND GOALS, PROVIDING A CONSISTENT USER EXPERIENCE ACROSS PLATFORMS.",
    items: [
      { name: "UI/UX", text: "Research-led interface design: flows, wireframes and polished screens that feel effortless to use.", deliverables: "USER FLOWS, WIREFRAMES, HIGH-FIDELITY FIGMA SCREENS, DESIGN SYSTEM", tools: ["Figma", "Prototyping", "Design systems"] },
      { name: "WEB DESIGN", text: "Distinctive, on-brand websites with purposeful typography, layout and motion.", deliverables: "ART DIRECTION, RESPONSIVE LAYOUTS, MOTION DESIGN, STYLE GUIDE", tools: ["Figma", "Tailwind CSS", "GSAP"] },
      { name: "LANDING PAGE DESIGN", text: "High-converting landing pages built to turn visitors into customers.", deliverables: "COPYWRITING STRUCTURE, CUSTOM 3D/GRAPHICS, WEBFLOW CODE", tools: ["React", "Next.js", "Webflow"] },
      { name: "WEB DEVELOPMENT", text: "Fast, secure and scalable websites and web apps, from static sites to full-stack products.", deliverables: "FRONT-END BUILD, APIS, CMS / ADMIN PANEL, DEPLOYMENT", tools: ["JavaScript", "Node.js", "Cloudflare", "MongoDB"] },
      { name: "DIGITAL MARKETING", text: "SEO, social and paid campaigns that put your website in front of the right people.", deliverables: "SEO AUDIT, CONTENT PLAN, AD CAMPAIGNS, ANALYTICS REPORTING", tools: ["SEO", "Google Ads", "Social media", "Analytics"] }
    ]
  },

  doors: {
    heading: "Magic happens behind the doors",
    hintDesktop: "HOVER A DOOR TO LIGHT THE LAMP · CLICK TO ENTER",
    hintMobile: "TAP A DOOR TO LIGHT THE LAMP · TAP AGAIN TO ENTER",
    enterDesktop: "Click to enter", enterMobile: "Tap again to enter",
    roomBack: "← BACK TO THE DOORS", roomLight: "LIGHT", roomHelp: "Drag to look around · Scroll or pinch to zoom · Tap the objects",
    roomScreen: "SCREEN", roomAbout: "ABOUT", roomFunctions: "FUNCTIONS", roomStack: "STACK", roomExit: "EXIT",
    roomOpen: "OPEN LIVE WEBSITE ↗", roomVisit: "VISIT SITE ↗", roomFull: "VIEW FULL SCREEN", aboutTitle: "ABOUT THIS WEBSITE", functionsTitle: "FUNCTIONS", stackTitle: "TECH STACK",
    exitTitle: "THANKS FOR VISITING", exitText: "Want a website like this? Let's build yours.", exitButton: "LET'S TALK",
    items: [
      { slug: "slayernodes", name: "SlayerNodes", plate: "WEBSITE", tagline: "BUILT BY PRISMORAWEBS", color: "#4b3fb8",
        bullets: ["High-speed game & cloud server hosting", "Custom client management dashboard", "Ultra-low latency infrastructure"],
        description: "SlayerNodes is a modern cloud server and game hosting platform designed, built and launched by PrismoraWebs. It combines high-performance infrastructure with an intuitive, clean interface.",
        functions: [
          { title: "Instant Deployment", text: "Automated provisioning with high-speed NVMe storage." },
          { title: "Global DDoS Defense", text: "Enterprise mitigation network protecting all game nodes." },
          { title: "Custom Dashboard", text: "Intuitive panel for real-time diagnostics and scaling." }
        ],
        tech: ["Cloudflare Workers", "Vanilla JavaScript", "Custom 3D Engine", "Modern CSS", "WebSockets"],
        facts: [{ label: "BUILT BY", value: "PrismoraWebs" }, { label: "TYPE", value: "Cloud Platform" }, { label: "STATUS", value: "Live & Active" }],
        liveLink: "https://slayernodes.com", links: [{ label: "VISIT SLAYERNODES ↗", url: "https://slayernodes.com" }], shot: "" }
    ]
  },
  ui: {
    notFoundEyebrow: "ERROR 404", notFoundTitle: "Lost in the hallway",
    notFoundText: "The door you tried doesn't exist. Let's get you back to the lobby.", notFoundButton: "BACK TO THE DOORS",
    legalEyebrow: "LEGAL", backHome: "← BACK TO HOME",
    privacyNote: "By sending this form you agree to our", privacyLinkText: "Privacy Policy",
    deliverablesLabel: "DELIVERABLES:", exitPlate: "EXIT",
    instagramLabel: "INSTAGRAM", twitterLabel: "TWITTER", linkedinLabel: "LINKEDIN", githubLabel: "GITHUB",
    menuLabel: "Menu", closeLabel: "Close", scrollLabel: "Scroll down", teamImageAlt: "The PrismoraWebs team",
    lookAroundLabel: "Look around", lightToggleLabel: "Toggle the light", fullScreenLabel: "View the website screenshot full screen",
    nextLabel: "Next website", prevLabel: "Previous website"
  },
  features: {
    roomDrag: "look",
    doorsAutoSeconds: "4.8",
    introAnimation: "yes",
    customCursor: "yes"
  },
  marquee: { items: ["UI/UX", "WEB DESIGN", "DEVELOPMENT", "DIGITAL MARKETING", "BRANDING", "LANDING PAGES", "SEO", "E-COMMERCE"] },
  stats: { items: [
    { value: "3", label: "FOUNDERS" }, { value: "100%", label: "CUSTOM-BUILT" }, { value: "24h", label: "TYPICAL FIRST REPLY" }, { value: "5", label: "CORE SERVICES" }
  ] },
  process: {
    title: "HOW WE WORK", subtitle: "A simple, transparent process from first call to launch day — and beyond.",
    steps: [
      { title: "DISCOVER", text: "We listen first: your goals, your audience and what success looks like." },
      { title: "DESIGN", text: "Wireframes and polished visuals you can react to, before any code is written." },
      { title: "BUILD", text: "Fast, secure, responsive development with regular progress updates." },
      { title: "LAUNCH & GROW", text: "We launch, measure and keep improving with SEO and marketing support." }
    ]
  },
  reviews: {
    title: "KIND WORDS", subtitle: "",
    items: []
  },
  faq: {
    title: "QUESTIONS, ANSWERED",
    items: [
      { q: "How long does a website take?", a: "A focused landing page can take around two weeks; a full website usually takes four to eight weeks depending on content and features." },
      { q: "How much does it cost?", a: "Every project is quoted after a short discovery call so you only pay for what you need. Send us your idea and we'll reply with a clear estimate." },
      { q: "Do you also handle marketing and SEO?", a: "Yes. Prince leads marketing — SEO, social media and paid campaigns — so your website gets found, not just built." },
      { q: "Will I be able to edit my website later?", a: "Yes. We can add an easy admin panel so you can update text and images yourself without touching code." },
      { q: "Who owns the website after launch?", a: "You do. On full payment, the design and custom code made for you are yours (see our Terms for details)." },
      { q: "How do we get started?", a: "Press “Let's talk”, tell us about your project and we'll get back within one working day." }
    ]
  },
  cta: { title1: "HAVE AN IDEA?", title2: "LET'S BUILD IT.", text: "Tell us what you're dreaming up — we'll show you what's possible.", button: "START A PROJECT" },
  why: {
    title: "WHY PRISMORAWEBS", subtitle: "Small team, big attention to detail.",
    items: [
      { title: "ONE TEAM, THREE SKILLS", text: "Planning, development and marketing under one roof — no hand-offs, no lost context." },
      { title: "CUSTOM-BUILT, NOT TEMPLATES", text: "Every website is designed and coded for your brand, goals and audience." },
      { title: "FAST & SECURE BY DEFAULT", text: "Modern hosting, clean code and security best practices from day one." },
      { title: "YOU OWN EVERYTHING", text: "Your design, your code, your content — and an easy admin panel to edit it." },
      { title: "CLEAR COMMUNICATION", text: "Regular updates, honest timelines and a reply within one working day." },
      { title: "BUILT TO BE FOUND", text: "SEO and performance are part of the build, not an afterthought." }
    ]
  },
  showcase: {
    heading: "FEATURED WEBSITES", hint: "DRAG TO EXPLORE · CLICK THE WEBSITE IN THE CENTRE TO ENTER ITS ROOM", enter: "ENTER THE ROOM →"
  },
  packages: {
    title: "PACKAGES", subtitle: "Every project is quoted individually — these are friendly starting points.",
    items: [
      { name: "LANDING PAGE", tag: "FAST LAUNCH", price: "Custom quote", featured: "no", text: "One powerful page that turns visitors into customers.", features: ["Single-page custom design", "Mobile-first build", "Contact form to your inbox", "Basic SEO setup", "Delivery in about 2 weeks"], cta: "GET A QUOTE" },
      { name: "BUSINESS WEBSITE", tag: "MOST POPULAR", price: "Custom quote", featured: "yes", text: "A complete multi-page website with an easy admin panel.", features: ["Up to 8 custom pages", "Admin panel for text & images", "SEO foundations", "Analytics setup", "Delivery in 4–6 weeks"], cta: "GET A QUOTE" },
      { name: "CUSTOM BUILD", tag: "WEB APPS & STORES", price: "Custom quote", featured: "no", text: "Stores, dashboards and web apps built around your idea.", features: ["Custom features & APIs", "E-commerce or booking flows", "Marketing & growth plan", "Ongoing support", "Scoped together with you"], cta: "LET'S TALK" }
    ]
  },
  toolkit: {
    title: "OUR TOOLKIT", subtitle: "The tools we reach for to design, build and grow your website.",
    items: ["Figma", "React", "Next.js", "Node.js", "MongoDB", "Tailwind CSS", "JavaScript", "TypeScript", "Cloudflare", "GSAP", "Three.js", "Webflow", "WordPress", "Stripe", "Google Analytics", "Search Console", "Meta Ads", "Google Ads", "Git & GitHub", "Framer"]
  },
  contact: {
    title: "LET'S TALK",
    contactButton: "CONTACT US",
    formTitle: "Let's work together",
    formSubtitle: "Tell us about your project — we usually reply within one working day.",
    nameLabel: "Your name", emailLabel: "Your email", serviceLabel: "Service needed", servicePlaceholder: "Choose a service",
    services: ["UI/UX Design", "Web Design", "Landing Page", "Web Development", "Digital Marketing", "Something else"],
    messageLabel: "Your message", messagePlaceholder: "Tell us about your project...",
    sendButton: "SEND MESSAGE",
    success: "Thank you! Your message has been sent — we'll get back to you soon.",
    error: "Something went wrong. Please try again or email us directly."
  },
  footer: {
    left: "© {year} PrismoraWebs. All rights reserved.",
    right: "Designed and built by PrismoraWebs",
    copyright: "© {year} PrismoraWebs. All rights reserved.",
    tagline: "A three-person web studio. We plan, design, build and market websites that stand out.",
    exploreTitle: "EXPLORE", legalTitle: "LEGAL", contactTitle: "CONTACT", startLabel: "Start a project",
    privacy: "PRIVACY", terms: "TERMS", cookies: "COOKIES", refund: "REFUNDS", disclaimer: "DISCLAIMER", accessibility: "ACCESSIBILITY", legalHub: "ALL LEGAL"
  },
  legal: {
    hub: {
      title: "Legal documentation",
      intro: "Everything you need to know about how PrismoraWebs handles your data, your projects and your rights. These documents are general templates and are updated from time to time."
    },
    refund: {
      title: "Refund & Cancellation Policy",
      updated: "Last updated: 11 November 2026",
      intro: "This policy explains how cancellations and refunds work for services provided by PrismoraWebs. The details of each project are confirmed in the written quote or proposal.",
      sections: [
        { heading: "1. Advance payment", body: "Most projects start after an advance payment. The advance secures your place in our schedule and covers planning and design work. It is non-refundable once work has begun, unless we agree otherwise in writing." },
        { heading: "2. Cancelling a project", body: "You may cancel at any time by writing to prismorawebs@gmail.com. You will pay for work completed up to the cancellation date and for any non-refundable third-party costs already incurred (for example domains, licences, stock assets or ad spend)." },
        { heading: "3. If we cancel", body: "If we are unable to deliver a project for reasons within our control, we will refund the portion of the payment that corresponds to work not yet delivered." },
        { heading: "4. Refund requests", body: "If you believe you are entitled to a refund, email us with your project details and the reason. We review every request fairly and respond within 7 working days. Approved refunds are returned to the original payment method." },
        { heading: "5. Delays caused by the client", body: "If a project is paused for more than 30 days because content, feedback or payments are pending, we may close the project and re-quote the remaining work." },
        { heading: "6. Ongoing services", body: "Recurring services such as maintenance or marketing can be cancelled with 30 days' written notice. Fees already paid for the current period are not refunded." },
        { heading: "7. Contact", body: "Questions about this policy? Email prismorawebs@gmail.com." }
      ]
    },
    disclaimer: {
      title: "Disclaimer",
      updated: "Last updated: 11 November 2026",
      intro: "The information on this website is provided in good faith for general information about PrismoraWebs and its services.",
      sections: [
        { heading: "1. No guarantees", body: "We work hard to keep the website accurate and available, but we make no warranty of any kind about completeness, accuracy, reliability or availability. Any reliance you place on the information is at your own risk." },
        { heading: "2. Portfolio and sample content", body: "Projects, case studies, reviews and statistics shown on this website may include sample content used for demonstration. Results differ for every business and past work is not a guarantee of future results." },
        { heading: "3. Not professional advice", body: "Content on this website is not legal, financial or tax advice. The legal pages are general templates; please consult a qualified professional for advice on your own situation." },
        { heading: "4. External links", body: "This website may link to websites we do not control. We are not responsible for their content, privacy practices or availability." },
        { heading: "5. Limitation of liability", body: "To the fullest extent permitted by law, PrismoraWebs is not liable for any loss or damage arising from your use of, or inability to use, this website." },
        { heading: "6. Contact", body: "Questions? Email prismorawebs@gmail.com." }
      ]
    },
    accessibility: {
      title: "Accessibility Statement",
      updated: "Last updated: 11 November 2026",
      intro: "PrismoraWebs wants its website to be usable by as many people as possible, including people who use assistive technology.",
      sections: [
        { heading: "1. Our commitment", body: "We aim to follow the Web Content Accessibility Guidelines (WCAG) 2.1 level AA wherever practical, and we keep improving as we learn." },
        { heading: "2. What we do", body: "We use semantic HTML, visible keyboard focus, text alternatives for meaningful graphics, sufficient colour contrast in reading areas and responsive layouts that work on phones, tablets and desktops. The website respects the “reduce motion” setting of your device." },
        { heading: "3. Known limitations", body: "Some decorative, animated and 3D experiences — such as the doors and the interactive rooms — rely on motion and pointer or touch input. Every room's key information is also available as normal text, and the live website links are standard links." },
        { heading: "4. Feedback", body: "If you find an accessibility barrier, please tell us at prismorawebs@gmail.com with the page and the problem you met. We will try to fix it quickly and reply within 7 working days." }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      updated: "Last updated: 10 November 2026",
      intro: "This Privacy Policy explains how PrismoraWebs (\"we\", \"us\", \"our\") collects, uses and protects your personal information when you visit our website or contact us. By using this website you agree to the practices described below.",
      sections: [
        { heading: "1. Who we are", body: "PrismoraWebs is a web design, development and digital marketing studio founded by Arman Alam, Niladri Yadav and Prince Ghosh. You can reach us at prismorawebs@gmail.com." },
        { heading: "2. Information we collect", body: "Information you give us: when you use our contact form or email us we receive your name, email address, the service you are interested in and the content of your message.\n\nInformation collected automatically: like most websites, our hosting provider (Cloudflare) processes technical data such as your IP address, browser type, device and pages requested, for security and to deliver the site. We do not run advertising trackers or sell visitor data." },
        { heading: "3. How we use your information", body: "We use your information to respond to your enquiry, to provide quotes and services you ask for, to keep the website secure and to prevent spam and abuse. We do not use your contact details for unrelated marketing without your consent." },
        { heading: "4. Legal basis", body: "Where data-protection laws such as the GDPR or India's Digital Personal Data Protection Act apply, we process your data based on your consent (when you send us a message), to take steps at your request before entering into a contract, and for our legitimate interest in running a secure website." },
        { heading: "5. Sharing your information", body: "We share information only with service providers who help us run the website and handle email — for example Cloudflare (hosting and security) and our email provider (Google/Gmail) — and when required by law. These providers may process data outside your country. We never sell your personal information." },
        { heading: "6. Third-party services", body: "Our pages load fonts from Google Fonts, which means your IP address is sent to Google when the page loads. Links to social networks and other websites are governed by their own privacy policies." },
        { heading: "7. Data retention", body: "We keep enquiry emails for as long as needed to handle your request and for a reasonable period afterwards for our records (normally up to 24 months), unless you ask us to delete them earlier or the law requires longer retention." },
        { heading: "8. Security", body: "We use HTTPS, restrict access to our admin systems, rate-limit forms and keep credentials in encrypted server-side secrets. No method of transmission over the internet is 100% secure, but we work to protect your information." },
        { heading: "9. Your rights", body: "Depending on where you live you may have the right to access, correct, delete or restrict the use of your personal data, to withdraw consent and to complain to a data-protection authority. To exercise any of these rights, email prismorawebs@gmail.com and we will respond within a reasonable time." },
        { heading: "10. Children", body: "This website is not directed at children under 16 and we do not knowingly collect their personal information. If you believe a child has sent us data, please contact us and we will delete it." },
        { heading: "11. Changes to this policy", body: "We may update this policy from time to time. The \"last updated\" date at the top shows when it was last revised. Continued use of the website after changes means you accept the updated policy." },
        { heading: "12. Contact", body: "Questions about this policy? Email prismorawebs@gmail.com." }
      ]
    },
    terms: {
      title: "Terms & Conditions",
      updated: "Last updated: 10 November 2026",
      intro: "These Terms & Conditions govern your use of the PrismoraWebs website and any services we provide. By using the site or engaging us, you agree to these terms.",
      sections: [
        { heading: "1. About these terms", body: "\"PrismoraWebs\", \"we\", \"us\" refers to the studio operated by Arman Alam, Niladri Yadav and Prince Ghosh. \"You\" means the visitor or client. If you do not agree with these terms, please do not use the website." },
        { heading: "2. Our services", body: "We provide web design, web development and digital marketing services. The scope, timeline and price of each project are agreed in a written quote, proposal or email before work starts. Anything outside the agreed scope may be quoted separately." },
        { heading: "3. Quotes, payments and timelines", body: "Quotes are valid for 14 days unless stated otherwise. Unless agreed differently, projects start after an advance payment and the remainder is due on delivery or as set out in the proposal. Timelines depend on you providing content, feedback and approvals promptly. Delays on your side may move delivery dates." },
        { heading: "4. Client responsibilities", body: "You agree to provide accurate information, to have the rights to any text, images, logos and other material you supply, and to review work and give feedback within a reasonable time." },
        { heading: "5. Intellectual property", body: "On full payment, you own the final website design and custom code we create specifically for you. We keep ownership of our pre-existing tools, templates, libraries and know-how, and of any third-party or open-source components (which remain under their own licences). We may show the finished work in our portfolio unless you ask us in writing not to." },
        { heading: "6. Revisions", body: "Each project includes the number of revision rounds stated in the proposal. Additional revisions or new features may be charged at our standard rates." },
        { heading: "7. Cancellation and refunds", body: "You may cancel a project at any time by notifying us in writing. Work completed up to that point and any non-refundable third-party costs (such as domains, licences or ad spend) remain payable. Advance payments are non-refundable once work has begun, unless otherwise agreed in writing." },
        { heading: "8. Acceptable use of this website", body: "You agree not to misuse the website: no attempts to gain unauthorised access, disrupt the service, send spam through our forms, scrape the site at scale or upload malicious code." },
        { heading: "9. Third-party links and services", body: "The website may link to third-party sites and use third-party services (hosting, email, fonts). We are not responsible for their content, availability or practices." },
        { heading: "10. Disclaimer", body: "The website and its content are provided \"as is\" without warranties of any kind. We aim for accuracy and uptime but do not guarantee that the site will always be available, error-free or free of harmful components. Portfolio items and testimonials are examples of our work and do not guarantee any particular results." },
        { heading: "11. Limitation of liability", body: "To the fullest extent permitted by law, PrismoraWebs will not be liable for indirect, incidental or consequential losses (including lost profits or data). Our total liability for any claim relating to a project is limited to the amount you paid us for that project." },
        { heading: "12. Governing law", body: "These terms are governed by the laws of India. Any dispute will first be discussed in good faith; if it cannot be resolved, it will be subject to the courts of India." },
        { heading: "13. Changes", body: "We may update these terms from time to time. The updated version applies from the date it is posted on this page." },
        { heading: "14. Contact", body: "Questions about these terms? Email prismorawebs@gmail.com." }
      ]
    },
    cookies: {
      title: "Cookie Policy",
      updated: "Last updated: 10 November 2026",
      intro: "This Cookie Policy explains how the PrismoraWebs website uses cookies and similar technologies.",
      sections: [
        { heading: "1. What are cookies?", body: "Cookies are small text files stored on your device by a website. They are used to make sites work, to keep them secure and, on some sites, to measure usage or show advertising." },
        { heading: "2. Cookies we use", body: "Strictly necessary cookies only. Our public pages do not set any cookies. The only cookie is a secure, HttpOnly session cookie (pw_session) that is created if the site owner signs in to the private admin area; it expires after 12 hours or when they sign out. We also store a harmless flag in your browser's session storage to show the intro animation once per visit." },
        { heading: "3. What we do not use", body: "We do not use advertising cookies, social-media tracking pixels or third-party analytics cookies on this website." },
        { heading: "4. Third-party services", body: "Fonts are loaded from Google Fonts and the site is delivered through Cloudflare. These services may process technical data such as your IP address to provide their service. Please see their privacy policies for details." },
        { heading: "5. Managing cookies", body: "You can block or delete cookies in your browser settings. Because we only use strictly necessary cookies for the private admin area, blocking cookies will not affect your use of the public website." },
        { heading: "6. Changes", body: "If we add analytics or other cookies in future, we will update this policy and ask for your consent where the law requires it." },
        { heading: "7. Contact", body: "Questions about cookies? Email prismorawebs@gmail.com." }
      ]
    }
  }
};
