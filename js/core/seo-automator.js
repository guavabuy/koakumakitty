/**
 * SEO Automator for Koakuma Kitty Blog
 * 
 * Automatically generates:
 * 1. JSON-LD Schema (BlogPosting, BreadcrumbList)
 * 2. Visual Breadcrumb Navigation
 * 3. Contextual Internal Links (BaZi, Five Elements, etc.)
 * 4. CTA Injection (Call to Action)
 */

class SeoAutomator {
    constructor() {
        this.config = {
            siteUrl: 'https://koakumakitty.com',
            siteName: 'Koakuma Kitty [易占] Fortune',
            authorName: 'Koakuma Kitty',
            logoUrl: 'https://koakumakitty.com/images/kitty-icon.jpg',
            // Internal linking dictionary (keyword -> path)
            links: {
                'BaZi': '/#bazi',
                '八字': '/#bazi',
                'Five Elements': '/#bazi',
                '五行': '/#bazi',
                'Day Master': '/#bazi',
                '2026': '/#yearly2026',
                'Fire Horse': '/#yearly2026',
                'Feng Shui': '/#fengshui',
                'I Ching': '/#yijing'
            },
            // Localization for Breadcrumbs
            i18n: {
                zh: {
                    home: '首页',
                    blog: '博客',
                    homeUrl: '/',
                    blogUrl: '/blog/'
                },
                en: {
                    home: 'Home',
                    blog: 'Blog',
                    homeUrl: '/en/',
                    blogUrl: '/blog/'
                },
                ja: {
                    home: 'ホーム',
                    blog: 'ブログ',
                    homeUrl: '/ja/',
                    blogUrl: '/blog/' // Assuming shared blog index for now
                }
            }
        };
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.run());
        } else {
            this.run();
        }
    }

    /**
     * Detect current language from <html lang="..."> or URL
     */
    getLanguage() {
        const htmlLang = document.documentElement.lang;
        const path = window.location.pathname;

        if (path.startsWith('/ja/') || htmlLang === 'ja') return 'ja';
        if (path.startsWith('/en/') || htmlLang === 'en') return 'en';
        return 'zh'; // Default to Chinese
    }

    run() {
        console.log('🐱 Koakuma SEO Automator: Start');
        
        const metadata = this.extractMetadata();
        if (!metadata) return;

        const lang = this.getLanguage();
        const t = this.config.i18n[lang];

        // 1. Generate & Inject JSON-LD Schema
        this.injectSchema(metadata, t);

        // 2. Generate & Inject Breadcrumbs
        this.injectBreadcrumbs(metadata.title, t);

        // 3. Process Content (Internal Links & CTA)
        this.processContent(lang);
        
        console.log('🐱 Koakuma SEO Automator: Done');
    }

    /**
     * Extract metadata from current page
     */
    extractMetadata() {
        const titleEl = document.querySelector('title');
        const descEl = document.querySelector('meta[name="description"]');
        const imgEl = document.querySelector('meta[property="og:image"]');
        const dateEl = document.querySelector('.article-meta .card-date, .article-meta span:nth-child(2)'); // Try to find date in header

        if (!titleEl) return null;

        // Parse date (simple heuristic)
        let datePublished = new Date().toISOString();
        if (dateEl) {
            const dateText = dateEl.textContent.replace('📅', '').trim();
            const parsed = new Date(dateText);
            if (!isNaN(parsed.getTime())) {
                datePublished = parsed.toISOString();
            }
        }

        return {
            title: titleEl.textContent.split('|')[0].trim(),
            description: descEl ? descEl.content : '',
            image: imgEl ? imgEl.content : this.config.logoUrl,
            url: window.location.href,
            datePublished: datePublished
        };
    }

    /**
     * Inject JSON-LD Schema
     */
    injectSchema(meta, t) {
        // BlogPosting Schema
        const blogSchema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": meta.title,
            "image": [meta.image],
            "datePublished": meta.datePublished,
            "dateModified": meta.datePublished,
            "author": [{
                "@type": "Person",
                "name": this.config.authorName,
                "url": this.config.siteUrl
            }],
            "publisher": {
                "@type": "Organization",
                "name": this.config.siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": this.config.logoUrl
                }
            },
            "description": meta.description,
            "inLanguage": this.getLanguage()
        };

        // BreadcrumbList Schema
        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": t.home,
                "item": this.config.siteUrl + t.homeUrl
            }, {
                "@type": "ListItem",
                "position": 2,
                "name": t.blog,
                "item": this.config.siteUrl + t.blogUrl
            }, {
                "@type": "ListItem",
                "position": 3,
                "name": meta.title
            }]
        };

        this.addJsonLd(blogSchema);
        this.addJsonLd(breadcrumbSchema);
    }

    addJsonLd(data) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    /**
     * Inject Visual Breadcrumbs
     */
    injectBreadcrumbs(currentTitle, t) {
        const header = document.querySelector('.article-header');
        if (!header) return;

        const backLink = header.querySelector('.back-link');
        
        // Create Breadcrumb container
        const breadcrumbNav = document.createElement('nav');
        breadcrumbNav.className = 'breadcrumb-nav';
        breadcrumbNav.setAttribute('aria-label', 'Breadcrumb');
        
        // Truncate title if too long
        const shortTitle = currentTitle.length > 30 ? currentTitle.substring(0, 30) + '...' : currentTitle;

        breadcrumbNav.innerHTML = `
            <a href="${t.homeUrl}" class="breadcrumb-link">${t.home}</a> 
            <span class="breadcrumb-separator">›</span>
            <a href="${t.blogUrl}" class="breadcrumb-link">${t.blog}</a>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">${shortTitle}</span>
        `;

        // Replace back link or prepend
        if (backLink) {
            backLink.replaceWith(breadcrumbNav);
        } else {
            header.prepend(breadcrumbNav);
        }
    }

    /**
     * Process Content: Auto-Linking & CTA
     */
    processContent(lang) {
        const contentDiv = document.querySelector('.article-content');
        if (!contentDiv) return;

        // 1. Auto-Linking
        this.linkKeywords(contentDiv);

        // 2. Inject CTA at the end
        this.injectCta(contentDiv, lang);
    }

    linkKeywords(rootNode) {
        const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
        const nodesToReplace = [];

        while (walker.nextNode()) {
            const node = walker.currentNode;
            // Skip if parent is already a link or script/style
            if (node.parentElement.tagName === 'A' || 
                node.parentElement.tagName === 'SCRIPT' || 
                node.parentElement.tagName === 'STYLE') {
                continue;
            }

            // Check for keywords
            for (const [keyword, url] of Object.entries(this.config.links)) {
                // Case-insensitive match, but preserve original casing in display
                const regex = new RegExp(`\\b(${this.escapeRegExp(keyword)})\\b`, 'i');
                if (regex.test(node.nodeValue)) {
                    nodesToReplace.push({ node, keyword, url, match: node.nodeValue.match(regex)[0] });
                    // Only replace one keyword per text node to avoid chaos
                    break; 
                }
            }
        }

        // Apply replacements
        nodesToReplace.forEach(({ node, keyword, url, match }) => {
            const span = document.createElement('span');
            // Split by the matched keyword
            const parts = node.nodeValue.split(match);
            
            // Create a fragment
            const fragment = document.createDocumentFragment();
            fragment.appendChild(document.createTextNode(parts[0]));
            
            const link = document.createElement('a');
            link.href = url;
            link.textContent = match; // Use the actual text found (preserves case)
            link.style.cssText = 'color: #ff69b4; text-decoration: underline; font-weight: 500;';
            fragment.appendChild(link);
            
            if (parts.length > 1) {
                fragment.appendChild(document.createTextNode(parts[1]));
            }

            node.parentNode.replaceChild(fragment, node);
        });
    }

    injectCta(contentDiv, lang) {
        const cta = document.createElement('div');
        cta.className = 'kitty-cta-box';
        
        // Localization for CTA
        const text = {
            zh: {
                title: '🔮 想要知道你的命运吗？',
                desc: '别让命运捉弄你！让 Kitty 帮你看看八字命盘。',
                btn: '开始免费测算 →',
                url: '/#bazi'
            },
            en: {
                title: '🔮 Curious about your destiny?',
                desc: "Don't leave it to chance! Let Koakuma Kitty analyze your BaZi chart.",
                btn: 'Start Free Calculation →',
                url: '/en/#bazi'
            },
            ja: {
                title: '🔮 自分の運命、気になりませんか？',
                desc: '運命に流されないで！Kittyに八字命盤を見てもらいましょう。',
                btn: '無料で占う →',
                url: '/ja/#bazi'
            }
        }[lang] || {
            // Default Fallback
             title: '🔮 Curious about your destiny?',
             desc: "Don't leave it to chance! Let Koakuma Kitty analyze your BaZi chart.",
             btn: 'Start Free Calculation →',
             url: '/en/#bazi'
        };

        cta.innerHTML = `
            <h3>${text.title}</h3>
            <p>${text.desc}</p>
            <a href="${text.url}" class="cta-button">
                ${text.btn}
            </a>
        `;
        
        contentDiv.appendChild(cta);
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Instantiate
new SeoAutomator();

