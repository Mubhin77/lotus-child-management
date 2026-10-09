import { useEffect, useState } from "react";
import "./LandingPage.css";
import logo from "../assets/logo.png";
// import hero1 from "../assets/image1.jpg";
import hero2 from "../assets/image2.jpg";
import hero3 from "../assets/image3.jpg";
import hero4 from "../assets/image4.jpg";
import philosophy from "../assets/image5.jpg";
import hero5 from "../assets/image6.jpg";
import hero6 from "../assets/image7.jpg";
import hero8 from "../assets/image8.jpg";
import hero7 from "../assets/image9.jpg";
import founder from "../assets/founder.png";

const images = {
  logo: logo,
  //   hero1: hero1,
  hero2: hero4,
  hero3: hero3,
  hero4: hero2,
  hero5: hero5,
  hero6: hero6,
  hero7: hero7,
  hero8: hero8,
  philosophy: philosophy,
  founder: founder,
};

const rotatingWords = [
  "Happy",
  "Safe",
  "Creative",
  "Confident",
  "Curious",
  "Loved",
  "Inspired",
  "Joyful",
];

const programs = [
  {
    name: "Play Group",
    shortName: "PG",
    age: "2–3 years",
    icon: "🌱",
    color: "pink",
    time: "9:00 AM – 2:00 PM",
    description:
      "A gentle and joyful introduction to school where children learn through play, exploration and meaningful interaction.",
    features: [
      "Play-based learning",
      "Social interaction",
      "Creative activities",
      "Early independence",
    ],
  },
  {
    name: "Nursery",
    shortName: "Nursery",
    age: "3–4 years",
    icon: "🌼",
    color: "orange",
    time: "9:00 AM – 4:00 PM",
    description:
      "A nurturing environment that helps children build confidence, communication skills and a love for learning.",
    features: [
      "Language development",
      "Practical life skills",
      "Creative expression",
      "Sensorial learning",
    ],
  },
  {
    name: "LKG",
    shortName: "LKG",
    age: "4–5 years",
    icon: "🌈",
    color: "teal",
    time: "9:00 AM – 4:00 PM",
    description:
      "Children develop stronger academic foundations while continuing to learn through hands-on Montessori experiences.",
    features: [
      "Early literacy",
      "Early numeracy",
      "Practical activities",
      "Confidence building",
    ],
  },
  {
    name: "UKG",
    shortName: "UKG",
    age: "5–6 years",
    icon: "🚀",
    color: "purple",
    time: "9:00 AM – 4:00 PM",
    description:
      "Preparing children for their next educational journey with confidence, curiosity and essential school-readiness skills.",
    features: [
      "School readiness",
      "Reading & writing",
      "Mathematical thinking",
      "Independent learning",
    ],
  },
];

const branches = [
  {
    name: "Birtamode",
    icon: "🏫",
    color: "teal",
    address: "Birtamode, Jhapa, Nepal",
    description:
      "Our main Lotus Montessori community, providing a warm and engaging environment for young learners.",
  },
  {
    name: "Charali",
    icon: "🌳",
    color: "orange",
    address: "Charali, Jhapa, Nepal",
    description:
      "A welcoming learning environment where children can explore, play and grow with confidence.",
  },
  {
    name: "Chandragadhi",
    icon: "🌸",
    color: "pink",
    address: "Chandragadhi, Jhapa, Nepal",
    description:
      "A caring Montessori environment focused on children's individual growth and development.",
  },
];

const galleryItems = [
  {
    image: images.hero2,
    title: "Learning Through Experience",
  },
  {
    image: images.hero8,
    title: "Creative Learning",
  },
  {
    image: images.hero4,
    title: "Happy Childhood",
  },
  {
    image: images.hero7,
    title: "Our Montessori Environment",
  },
  {
    image: images.hero5,
    title: "Exploration & Discovery",
  },
  {
    image: images.hero6,
    title: "Growing Together",
  },
];

const faqs = [
  {
    question: "What are the school timings?",
    answer:
      "Our regular school hours are generally from 9:00 AM to 4:00 PM for Nursery, LKG and UKG. Play Group follows a shorter schedule from 9:00 AM to 2:00 PM.",
  },
  {
    question: "Do you provide transportation?",
    answer:
      "Transportation availability depends on the branch and location. Please contact your preferred Lotus branch for current transportation options.",
  },
  {
    question: "Do children receive meals or snacks?",
    answer:
      "Children follow a school-day routine that includes meal and snack arrangements depending on their program and branch. Please contact the school for the current menu and arrangements.",
  },
  {
    question: "How do you ensure children's safety?",
    answer:
      "We maintain a caring and supervised environment with teachers and staff who closely support children throughout their school day.",
  },
  {
    question: "What is the teacher-student ratio?",
    answer:
      "We aim to maintain an environment where teachers can give children meaningful individual attention while supporting group activities and learning.",
  },
  {
    question: "Can parents visit the school?",
    answer:
      "Yes. Parents are welcome to contact us and arrange a school visit to learn more about our environment, programs and approach.",
  },
];

const testimonials = [
  {
    name: "Ronij Joshi",
    branch: "Birtamode",
    initial: "R",
    text: "Lotus has created such a warm environment for children. We have seen our child become much more confident and independent.",
  },
  {
    name: "Riya Sharma",
    branch: "Charali",
    initial: "R",
    text: "The teachers are caring and genuinely interested in the children's development. Our child looks forward to going to school every day.",
  },
  {
    name: "Prakash Gurung",
    branch: "Chandragadhi",
    initial: "P",
    text: "We really appreciate the balance between learning and play. Lotus feels like a second home for our child.",
  },
];

function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % rotatingWords.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      }

      if (event.key === "ArrowRight") {
        setLightboxIndex((current) =>
          current === null ? 0 : (current + 1) % galleryItems.length,
        );
      }

      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) =>
          current === null
            ? 0
            : (current - 1 + galleryItems.length) % galleryItems.length,
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="lotus-page">
      {/* ================= NAVBAR ================= */}
      <nav className="lotus-nav">
        <div className="nav-container">
          <button
            className="brand-logo"
            onClick={() => scrollToSection("home")}
            aria-label="Go to homepage"
          >
            <div className="brand-image-wrap">
              <img src={images.logo} alt="Lotus Montessori logo" />
            </div>

            <div className="brand-text">
              <span className="brand-name">Lotus Montessori</span>
              <span className="brand-tagline">NURTURING YOUNG MINDS</span>
            </div>
          </button>

          <div className={`nav-links ${mobileOpen ? "mobile-active" : ""}`}>
            <button onClick={() => scrollToSection("home")}>Home</button>
            <button onClick={() => scrollToSection("about")}>About</button>
            <button onClick={() => scrollToSection("programs")}>
              Programs
            </button>
            <button onClick={() => scrollToSection("branches")}>
              Branches
            </button>
            <button onClick={() => scrollToSection("teachers")}>
              Teachers
            </button>
            <button onClick={() => scrollToSection("gallery")}>Gallery</button>
            <button onClick={() => scrollToSection("contact")}>Contact</button>

            <button
              className="nav-apply"
              onClick={() => scrollToSection("admissions")}
            >
              Apply Now
              <span>→</span>
            </button>

            <a className="nav-login" href="/login">
              Login
            </a>
          </div>

          <button
            className={`mobile-toggle ${mobileOpen ? "open" : ""}`}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section id="home" className="hero-section">
        <div className="hero-decoration hero-decoration-one">✦</div>
        <div className="hero-decoration hero-decoration-two">🌸</div>
        <div className="hero-decoration hero-decoration-three">✦</div>

        <div className="hero-container">
          <div className="hero-content reveal">
            <div className="hero-badge">
              <span className="badge-dot" />
              Admissions Open 2026
            </div>

            <span className="hero-handwritten">
              Welcome to Lotus Montessori
            </span>

            <h1>
              Where Children Grow{" "}
              <span className="hero-gradient-word" key={wordIndex}>
                {rotatingWords[wordIndex]}
              </span>
            </h1>

            <p className="hero-description">
              A warm, joyful and nurturing Montessori environment where children
              learn through curiosity, creativity, play and meaningful
              experiences.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => scrollToSection("admissions")}
              >
                Start Your Journey
                <span>→</span>
              </button>

              <button
                className="secondary-button"
                onClick={() => scrollToSection("branches")}
              >
                Explore Our Branches
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <span>🌸</span>
                <span>🌼</span>
                <span>🌈</span>
              </div>

              <div>
                <strong>Growing with Lotus</strong>
                <small>Learning • Caring • Growing</small>
              </div>
            </div>
          </div>

          <div className="hero-visual reveal">
            <div className="hero-visual-glow" />

            <div className="hero-image-grid">
              <div className="hero-photo hero-photo-large">
                <img src={images.hero2} alt="Lotus Montessori" />
                <div className="photo-label">
                  <span>🌱</span>
                  Learn through play
                </div>
              </div>

              <div className="hero-photo hero-photo-small hero-photo-top">
                <img src={images.hero3} alt="Lotus Montessori activities" />
              </div>

              <div className="hero-photo hero-photo-small hero-photo-bottom">
                <img src={images.hero4} alt="Lotus Montessori children" />
              </div>

              <div className="hero-logo-card">
                <img src={images.logo} alt="Lotus Montessori" />
                <span>LOTUS</span>
                <small>Montessori</small>
              </div>
            </div>

            <div className="floating-note note-one">
              <span>🌈</span>
              Happy Learning
            </div>

            <div className="floating-note note-two">
              <span>💗</span>
              Every Child Matters
            </div>
          </div>
        </div>

        <div className="hero-scroll">
          <span>Scroll to explore</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ================= HIGHLIGHTS ================= */}
      <section className="highlights-section">
        <div className="section-container">
          <div className="highlights-grid">
            <article className="highlight-card reveal">
              <div className="highlight-icon pink">📚</div>
              <div>
                <h3>Quality Programs</h3>
                <p>
                  Carefully designed learning experiences that support every
                  stage of early childhood.
                </p>
              </div>
            </article>

            <article className="highlight-card reveal">
              <div className="highlight-icon orange">🛡️</div>
              <div>
                <h3>Safe Environment</h3>
                <p>
                  A warm and caring environment where children feel secure,
                  respected and valued.
                </p>
              </div>
            </article>

            <article className="highlight-card reveal">
              <div className="highlight-icon teal">👩‍🏫</div>
              <div>
                <h3>Expert Teachers</h3>
                <p>
                  Caring educators who guide children with patience,
                  understanding and encouragement.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Our Story</span>
            <h2>
              Growing with <span>purpose</span>
            </h2>
            <p>
              At Lotus Montessori, we believe childhood should be filled with
              curiosity, confidence, kindness and joy.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-image-wrapper reveal">
              <div className="about-image-frame">
                <img
                  src={images.philosophy}
                  alt="Lotus Montessori philosophy"
                />
              </div>

              <div className="about-floating-card">
                <span>🌸</span>
                <div>
                  <strong>Child First</strong>
                  <small>Always</small>
                </div>
              </div>

              <div className="about-circle">
                <span>LOVE</span>
                <small>LEARN</small>
                <span>GROW</span>
              </div>
            </div>

            <div className="about-content reveal">
              <span className="content-label">The Lotus Philosophy</span>

              <h3>
                A childhood where learning feels like <span>discovery.</span>
              </h3>

              <p>
                Our Montessori-inspired approach encourages children to explore
                their surroundings, make choices, develop independence and learn
                at their own pace.
              </p>

              <p>
                We combine meaningful hands-on experiences with caring guidance
                so that children develop academically, emotionally, socially and
                physically.
              </p>

              <div className="about-values">
                <div className="value-card">
                  <span>🌱</span>
                  <div>
                    <strong>Independence</strong>
                    <p>Helping children become confident learners.</p>
                  </div>
                </div>

                <div className="value-card">
                  <span>💡</span>
                  <div>
                    <strong>Curiosity</strong>
                    <p>Encouraging children to ask, explore and discover.</p>
                  </div>
                </div>

                <div className="value-card">
                  <span>💗</span>
                  <div>
                    <strong>Kindness</strong>
                    <p>Building empathy, respect and positive relationships.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="why-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Why Lotus?</span>
            <h2>
              More than a school. <span>A community.</span>
            </h2>
            <p>
              We create an environment where children feel seen, heard and
              encouraged to become their best selves.
            </p>
          </div>

          <div className="why-grid">
            {[
              [
                "🏆",
                "Proven Track Record",
                "A trusted Montessori community focused on children's growth.",
              ],
              [
                "📍",
                "Three Convenient Locations",
                "Families can choose from Birtamode, Charali and Chandragadhi.",
              ],
              [
                "🏡",
                "Family-Like Community",
                "We build strong relationships between children, teachers and parents.",
              ],
              [
                "🌸",
                "Authentic Montessori Values",
                "Children learn through independence, exploration and hands-on experiences.",
              ],
              [
                "💗",
                "Individual Attention",
                "Every child is unique and deserves meaningful attention and support.",
              ],
              [
                "🌈",
                "Holistic Development",
                "We nurture academic, social, emotional and physical development.",
              ],
            ].map(([icon, title, description], index) => (
              <article className="why-card reveal" key={title}>
                <span className={`why-number number-${(index % 3) + 1}`}>
                  0{index + 1}
                </span>
                <div className="why-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOUNDER ================= */}
      <section className="founder-section">
        <div className="section-container">
          <div className="founder-card reveal">
            <div className="founder-decoration">“</div>

            <div className="founder-avatar">
              <span>M.K</span>
            </div>

            <div className="founder-content">
              <span className="section-eyebrow">Meet Our Founder</span>
              <h2>Muna KC</h2>
              <span className="founder-role">Founder & Principal</span>

              <blockquote>
                “Every child carries a unique light within them. Our
                responsibility is not to shape every child the same way, but to
                help that light shine.”
              </blockquote>

              <p>
                With a deep passion for early childhood education, Muna KC has
                helped shape Lotus Montessori into a community where children
                are encouraged to learn with confidence, kindness and joy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROGRAMS ================= */}
      <section id="programs" className="programs-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Our Programs</span>
            <h2>
              Learning for every <span>little stage.</span>
            </h2>
            <p>
              Our programs are designed around the developmental needs of young
              children from their earliest school experience to school
              readiness.
            </p>
          </div>

          <div className="programs-grid">
            {programs.map((program) => (
              <article
                className={`program-card ${program.color} reveal`}
                key={program.name}
              >
                <div className="program-top">
                  <div className="program-pattern" />
                  <span className="program-icon">{program.icon}</span>
                  <span className="program-code">{program.shortName}</span>
                  <h3>{program.name}</h3>
                </div>

                <div className="program-body">
                  <div className="program-meta">
                    <span>👶 {program.age}</span>
                    <span>🕘 {program.time}</span>
                  </div>

                  <p>{program.description}</p>

                  <ul>
                    {program.features.map((feature) => (
                      <li key={feature}>
                        <span>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="program-link"
                    onClick={() => scrollToSection("admissions")}
                  >
                    Learn about admission <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BRANCHES ================= */}
      <section id="branches" className="branches-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Find Us</span>
            <h2>
              Growing across <span>Jhapa.</span>
            </h2>
            <p>
              Choose the Lotus Montessori branch that works best for your
              family.
            </p>
          </div>

          <div className="branches-grid">
            {branches.map((branch) => (
              <article
                className={`branch-card ${branch.color} reveal`}
                key={branch.name}
              >
                <div className="branch-visual">
                  <div className="branch-visual-circle" />
                  <span>{branch.icon}</span>
                  <small>LOTUS MONTESSORI</small>
                </div>

                <div className="branch-content">
                  <span className="branch-label">Our Branch</span>
                  <h3>{branch.name}</h3>

                  <div className="branch-info">
                    <span>📍</span>
                    <p>{branch.address}</p>
                  </div>

                  <p className="branch-description">{branch.description}</p>

                  <div className="branch-actions">
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="branch-primary"
                    >
                      Contact Us
                    </button>

                    <button
                      onClick={() => scrollToSection("admissions")}
                      className="branch-secondary"
                    >
                      Enquire →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TEACHERS ================= */}
      <section id="teachers" className="teachers-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Our People</span>
            <h2>
              Teachers who <span>care deeply.</span>
            </h2>
            <p>
              Children learn best when they feel safe, understood and
              encouraged.
            </p>
          </div>

          <div className="teachers-grid">
            <article className="teacher-card reveal">
              <div className="teacher-photo">
                <span>MK</span>
              </div>

              <span className="teacher-role">Founder & Principal</span>
              <h3>Muna KC</h3>
              <p>
                Passionate about creating meaningful early childhood experiences
                and a loving learning environment.
              </p>

              <div className="teacher-tags">
                <span>Leadership</span>
                <span>Montessori</span>
              </div>
            </article>

            <div className="teacher-message reveal">
              <span className="teacher-message-icon">💗</span>
              <span className="section-eyebrow">A caring team</span>
              <h3>
                Every teacher at Lotus plays a part in helping children feel
                confident.
              </h3>
              <p>
                Our educators guide rather than simply instruct, allowing
                children to develop independence while knowing that someone is
                always there to support them.
              </p>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-button"
              >
                Talk to our team →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section id="gallery" className="gallery-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Little Moments</span>
            <h2>
              Life at <span>Lotus.</span>
            </h2>
            <p>
              A glimpse into the joyful, creative and caring environment we
              create for children.
            </p>
          </div>

          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <button
                className={`gallery-item gallery-${index + 1} reveal`}
                key={`${item.title}-${index}`}
                onClick={() => setLightboxIndex(index)}
              >
                <img src={item.image} alt={item.title} />
                <div className="gallery-overlay">
                  <span>View</span>
                  <strong>{item.title}</strong>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ADMISSIONS ================= */}
      <section id="admissions" className="admissions-section">
        <div className="section-container">
          <div className="section-heading light reveal">
            <span className="section-eyebrow">Admissions</span>
            <h2>
              Let's begin their <span>Lotus journey.</span>
            </h2>
            <p>
              We would love to meet your family and help you find the right
              program for your child.
            </p>
          </div>

          <div className="admission-grid">
            <div className="admission-process reveal">
              <span className="process-label">HOW IT WORKS</span>
              <h3>Simple steps to get started.</h3>

              {[
                [
                  "01",
                  "Make an Inquiry",
                  "Contact us or submit the inquiry form.",
                ],
                [
                  "02",
                  "Visit the School",
                  "Come and experience our environment.",
                ],
                [
                  "03",
                  "Choose a Program",
                  "Find the right program for your child.",
                ],
                [
                  "04",
                  "Complete Admission",
                  "Our team will guide you through the process.",
                ],
                [
                  "05",
                  "Welcome to Lotus",
                  "Your child's learning journey begins.",
                ],
              ].map(([number, title, description]) => (
                <div className="admission-step" key={number}>
                  <span className="step-number">{number}</span>
                  <div>
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="admission-form-card reveal">
              <div className="form-card-header">
                <span>🌸</span>
                <div>
                  <span className="form-eyebrow">ENQUIRE TODAY</span>
                  <h3>Tell us about your child.</h3>
                </div>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  alert(
                    "Thank you! Your inquiry has been received. We will contact you soon.",
                  );
                }}
              >
                <div className="form-row">
                  <div className="field">
                    <label>Parent / Guardian Name</label>
                    <input type="text" placeholder="Your name" required />
                  </div>

                  <div className="field">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="98XXXXXXXX" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>Child's Name</label>
                    <input type="text" placeholder="Child's name" required />
                  </div>

                  <div className="field">
                    <label>Program</label>
                    <select defaultValue="">
                      <option value="" disabled>
                        Select program
                      </option>
                      <option>Play Group</option>
                      <option>Nursery</option>
                      <option>LKG</option>
                      <option>UKG</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Preferred Branch</label>
                  <select defaultValue="">
                    <option value="" disabled>
                      Select branch
                    </option>
                    <option>Birtamode</option>
                    <option>Charali</option>
                    <option>Chandragadhi</option>
                  </select>
                </div>

                <div className="field">
                  <label>Message</label>
                  <textarea
                    placeholder="Anything you'd like us to know?"
                    rows={4}
                  />
                </div>

                <button type="submit" className="form-submit">
                  Send Inquiry <span>→</span>
                </button>
              </form>
            </div>
          </div>

          <div className="eligibility reveal">
            <span>Age eligibility</span>
            <div>
              <strong>PG</strong>
              <small>2+ years</small>
            </div>
            <div>
              <strong>Nursery</strong>
              <small>3+ years</small>
            </div>
            <div>
              <strong>LKG</strong>
              <small>4+ years</small>
            </div>
            <div>
              <strong>UKG</strong>
              <small>5+ years</small>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Parent Voices</span>
            <h2>
              What families say about <span>Lotus.</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <article
                className="testimonial-card reveal"
                key={testimonial.name}
              >
                <div className="quote-mark">“</div>

                <div className="stars">★★★★★</div>

                <p>{testimonial.text}</p>

                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.initial}</div>

                  <div>
                    <strong>{testimonial.name}</strong>
                    <small>{testimonial.branch} Branch</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      {/* <section className="faq-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Questions?</span>
            <h2>
              We've got <span>answers.</span>
            </h2>
            <p>
              Everything parents usually want to know before joining the Lotus
              family.
            </p>
          </div>

          <div className="faq-container">
            {faqs.map((faq, index) => {
              const active = activeFaq === index;

              return (
                <button
                  className={`faq-item ${active ? "active" : ""} reveal`}
                  key={faq.question}
                  onClick={() => setActiveFaq(active ? null : index)}
                >
                  <div className="faq-question">
                    <span>{faq.question}</span>
                    <span className="faq-icon">{active ? "−" : "+"}</span>
                  </div>

                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* ================= FAQ ================= */}
      <section className="faq-section">
        <div className="section-container">
          <div className="section-heading reveal">
            <span className="section-eyebrow">Questions?</span>

            <h2>
              We've got <span>answers.</span>
            </h2>

            <p>
              Everything parents usually want to know before joining the Lotus
              family.
            </p>
          </div>

          <div className="faq-container">
            {faqs.map((faq, index) => {
              const active = activeFaq === index;

              return (
                <div
                  className={`faq-item ${active ? "active" : ""}`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={active}
                    onClick={() => setActiveFaq(active ? null : index)}
                  >
                    <span>{faq.question}</span>

                    <span className="faq-icon" aria-hidden="true">
                      {active ? "−" : "+"}
                    </span>
                  </button>

                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="contact-section">
        <div className="contact-blur contact-blur-one" />
        <div className="contact-blur contact-blur-two" />

        <div className="section-container contact-container">
          <div className="contact-info reveal">
            <span className="section-eyebrow">Get in Touch</span>
            <h2>
              Let's talk about your child's <span>next step.</span>
            </h2>
            <p>
              Have questions about admissions, programs or visiting Lotus? Our
              team would love to hear from you.
            </p>

            <div className="contact-details">
              <div className="contact-detail">
                <span>📍</span>
                <div>
                  <strong>Our Locations</strong>
                  <p>Birtamode • Charali • Chandragadhi</p>
                </div>
              </div>

              <div className="contact-detail">
                <span>✉️</span>
                <div>
                  <strong>Email</strong>
                  <p>lotuspreschoolandchildcare@gmail.com</p>
                </div>
              </div>

              <div className="contact-detail">
                <span>🕘</span>
                <div>
                  <strong>School Hours</strong>
                  <p>Monday – Friday • 9:00 AM – 4:00 PM</p>
                </div>
              </div>

              <div className="contact-detail">
                <span>📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>9816160081 / 9817963282</p>
                </div>
              </div>
            </div>

            <div className="social-links">
              <a
                href="https://www.facebook.com/profile.php?id=100057215059097"
                aria-label="Facebook"
              >
                f
              </a>
              <a href="#" aria-label="Instagram">
                ◎
              </a>
              <a
                href="https://www.tiktok.com/@lotus.preschool.o"
                aria-label="Tiktok"
              >
                ▶
              </a>
            </div>
          </div>

          <div className="contact-form-card reveal">
            <div className="contact-form-heading">
              <span>💌</span>
              <div>
                <small>CONTACT US</small>
                <h3>Send us a message</h3>
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                alert("Thank you! Your message has been received.");
              }}
            >
              <div className="form-row">
                <div className="field">
                  <label>Your Name</label>
                  <input type="text" placeholder="Your name" required />
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input type="tel" placeholder="98XXXXXXXX" required />
                </div>
              </div>

              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" />
              </div>

              <div className="field">
                <label>Message</label>
                <textarea rows={5} placeholder="How can we help?" required />
              </div>

              <button className="contact-submit" type="submit">
                Send Message <span>→</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="lotus-footer">
        <div className="section-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <button
                className="footer-logo"
                onClick={() => scrollToSection("home")}
              >
                <img src={images.logo} alt="Lotus Montessori" />
                <div>
                  <strong>Lotus Montessori</strong>
                  <small>NURTURING YOUNG MINDS</small>
                </div>
              </button>

              <p>
                Creating a joyful, nurturing and meaningful early childhood
                experience where every child is encouraged to learn, explore and
                grow.
              </p>

              <div className="footer-socials">
                <a href="https://www.facebook.com/profile.php?id=100057215059097">
                  f
                </a>
                <a href="#">◎</a>
                <a href="https://www.tiktok.com/@lotus.preschool.o">▶</a>
              </div>
            </div>

            <div className="footer-column">
              <h3>Explore</h3>
              <button onClick={() => scrollToSection("about")}>About Us</button>
              <button onClick={() => scrollToSection("programs")}>
                Programs
              </button>
              <button onClick={() => scrollToSection("branches")}>
                Branches
              </button>
              <button onClick={() => scrollToSection("gallery")}>
                Gallery
              </button>
            </div>

            <div className="footer-column">
              <h3>Admissions</h3>
              <button onClick={() => scrollToSection("admissions")}>
                Admission Process
              </button>
              <button onClick={() => scrollToSection("admissions")}>
                Age Eligibility
              </button>
              <button onClick={() => scrollToSection("contact")}>
                Contact Us
              </button>
              <button onClick={() => scrollToSection("faq")}>FAQs</button>
            </div>

            <div className="footer-column">
              <h3>Our Branches</h3>
              <button onClick={() => scrollToSection("branches")}>
                Birtamode
              </button>
              <button onClick={() => scrollToSection("branches")}>
                Charali
              </button>
              <button onClick={() => scrollToSection("branches")}>
                Chandragadhi
              </button>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} Lotus Montessori. All rights
              reserved.
            </p>

            <span>
              Made with <b>♥</b> for little learners.
            </span>
          </div>
        </div>
      </footer>

      {/* ================= LIGHTBOX ================= */}
      {lightboxIndex !== null && (
        <div className="lightbox" onClick={() => setLightboxIndex(null)}>
          <button
            className="lightbox-close"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close gallery"
          >
            ×
          </button>

          <button
            className="lightbox-arrow lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              setLightboxIndex(
                (lightboxIndex - 1 + galleryItems.length) % galleryItems.length,
              );
            }}
            aria-label="Previous image"
          >
            ‹
          </button>

          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={galleryItems[lightboxIndex].image}
              alt={galleryItems[lightboxIndex].title}
            />

            <div>
              <span>LOTUS MONTESSORI</span>
              <h3>{galleryItems[lightboxIndex].title}</h3>
            </div>
          </div>

          <button
            className="lightbox-arrow lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
            }}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
