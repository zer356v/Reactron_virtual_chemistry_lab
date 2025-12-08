import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card";
import { Activity,BarChart3,Sparkles,Route,} from "lucide-react";
import { motion , AnimatePresence } from "framer-motion";
import image from "../assets/image.png";
import Acid_Base_Titration from "../assets/Acid_Base_Titration.jpg";
import Salt_Analysis from "../assets/Salt_Analysis.jpg";
import Electrolysis_of_Water from "../assets/Electrolysis_of_Water.jpg";
import D_LAB_SIMULATION_ENGINE from "../assets/3D_LAB_SIMULATION_ENGINE.jpg";
import Electrochemistry_Redox_Systems from "../assets/Electrochemistry_Redox_Systems.jpg";
import Inorganic_Chemistry_Salt_Reactions from "../assets/Inorganic_Chemistry_Salt_Reactions.jpg";
import Laboratory_Skills_Techniques from "../assets/Laboratory_Skills_Techniques.jpg";
import Organic_Chemistry_Mechanisms from "../assets/Organic_Chemistry_Mechanisms.jpg";
import Physical_Chemistry_Fundamentals from "../assets/Physical_Chemistry_Fundamentals.jpg";
import reactron_bg_video from "../assets/reactron_bg_video.mp4";
import banner1 from "../assets/Banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";
import banner4 from "../assets/banner4.jpg";
import footer from "../assets/footer.mp4";
import logo3 from "../assets/logo3.png"
import DownloadSection from "@/components/DownloadSection";

const domains = {
  Physical: {
    title: "Physical Chemistry Fundamentals",
    description:
      "Bonding, buffers, equilibrium and matter behavior. Explore physical chemistry in real-time with particle motion visualized at atomic scale.",
    stats: [
      { value: "50+", label: "Core Experiments" },
      { value: "20+", label: "Mini Simulations" },
      { value: "100%", label: "Safe Practice" },
    ],
    image: Physical_Chemistry_Fundamentals,
  },

  Inorganic: {
    title: "Inorganic Chemistry & Salt Reactions",
    description:
      "Dive through oxidation states, complex ions, ionic salts, and transition metal reactivity with live precipitation & flame color outputs.",
    stats: [
      { value: "40+", label: "Reagent Tests" },
      { value: "15+", label: "Colored Compounds" },
      { value: "Live", label: "Observation Output" },
    ],
    image: Inorganic_Chemistry_Salt_Reactions,
  },

  Organic: {
    title: "Organic Chemistry & Mechanisms",
    description:
      "Hydrocarbons to alcohols — watch chain reactions animate, functional groups transform and organic mechanisms visualized step-by-step.",
    stats: [
      { value: "35+", label: "Mechanisms" },
      { value: "25+", label: "Functional Groups" },
      { value: "Visual", label: "Reaction Pathways" },
    ],
    image: Organic_Chemistry_Mechanisms,
  },

  Electrochemistry: {
    title: "Electrochemistry & Redox Systems",
    description:
      "Redox cells, electrolysis, conductivity and EMF mapping with live-ion drift animations. Build cells, switch electrodes, observe potential.",
    stats: [
      { value: "12+", label: "Electro Cells" },
      { value: "Realtime", label: "Voltage Output" },
      { value: "Ionic", label: "Flow Simulation" },
    ],
    image: Electrochemistry_Redox_Systems,
  },

  "Practical Skills": {
    title: "Laboratory Skills & Techniques",
    description:
      "Learn pipetting, titration handling, burette reading, flame safety, filtration, crystallization, and lab-grade precision techniques.",
    stats: [
      { value: "Hands-on", label: "Skill Training" },
      { value: "Guided", label: "Procedures" },
      { value: "0 Risk", label: "Full Safety" },
    ],
    image: Laboratory_Skills_Techniques,
  },
};


// =============== TYPES & SMALL COMPONENTS ===============

interface GlassProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

const GlassCard: FC<GlassProps> = ({ title, description, icon }) => (
  <Card className="bg-white/5 backdrop-blur-2xl border border-white/15 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-white/10">{icon}</div>
        <CardTitle className="text-white text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-gray-200 text-sm">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);

interface ExperimentCardProps {
  title: string;
  tag: string;
  level: string;
  duration: string;
  imageSrc: string;
}

const ExperimentCard: FC<ExperimentCardProps> = ({
  title,
  tag,
  level,
  duration,
  imageSrc,
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-black/60 border border-white/10 shadow-2xl group cursor-pointer">
    <img
      src={imageSrc}
      alt={title}
      className="w-full h-56 object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
    <div className="absolute bottom-4 left-4 right-4 space-y-2">
      <span className="inline-block text-[11px] uppercase tracking-[0.15em] text-orange-300">
        {tag}
      </span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="flex items-center justify-between text-[12px] text-gray-300">
        <span>{level}</span>
        <span>{duration}</span>
      </div>
    </div>
  </div>
);

// ============================ MAIN PAGE ============================

const Index: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

    const [active, setActive] = useState  ("Physical");
    const d = domains[active];

  const handleCTAClick = () => {
    navigate(user ? "/lab" : "/auth");
  };
  const handleLabAccess = () => {
  navigate(user ? "/lab" : "/auth");
};


  return (
    <div className="bg-[#050406] text-white w-full overflow-hidden">
      {/* =================== TOP NAV =================== */}
      <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-5">
        <img
          src={logo3}
          alt="Reactron logo"
          className="h-12 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-[0.2em] uppercase text-gray-200">
          <button type="button" className="hover:text-white uppercase transition-colors">Overview</button>
          <button type="button" className="hover:text-white uppercase transition-colors">
            Experiments
          </button>
          <button type="button" className="hover:text-white uppercase transition-colors">
            Features
          </button>
          <button type="button" className="hover:text-white uppercase transition-colors">
            Schools
          </button>
        </nav>
        <button
          type="button"
          onClick={handleCTAClick}
          className="px-5 py-2  bg-white/10 border border-white/30 text-xs tracking-[0.16em] uppercase hover:bg-white hover:text-black transition-all"
        >
          {user ? "Enter Lab" : "Get Started"}
        </button>
      </header>

      {/* =================== HERO SECTION (Explore the Galaxy style) =================== */}
      <section className="relative w-full h-[88vh] sm:h-[92vh] lg:h-screen overflow-hidden">
      {/* === Background VIDEO instead of image === */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={reactron_bg_video} type="video/mp4" /> {/* <- your video path */}
      </video>

      {/* Overlays for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f2b36a]/10 via-[#130a09]/45 to-black" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

      {/* ================= HERO CONTENT ================= */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">

        <p className="text-[10px] sm:text-[20px] tracking-[0.28em] text-orange-200 opacity-90 mb-3">
          The safest way to
        </p>

        <h1 className="font-extrabold leading-[1.15] text-[32px] sm:text-[46px] md:text-[60px] lg:text-[74px] text-white drop-shadow-md">
          EXPLORE THE{" "}
          <span className="text-yellow-200 drop-shadow-[0_0_30px_rgba(255,228,140,0.6)]">
            CHEMISTRY LAB
          </span>
        </h1>

        <p className="mt-3 sm:mt-4 text-[13px] sm:text-[15px] md:text-base text-orange-50/90 max-w-xl md:max-w-2xl">
          Reactron transforms any device into a real-time virtual laboratory.
          Perform board-level experiments with cinematic visuals, instant feedback
          and zero chemical cost.
        </p>

        {/* ==== DATA BAR (RESPONSIVE) ==== */}
        <div className="mt-8 sm:mt-10 w-full max-w-xl md:max-w-3xl   bg-black/40 rounded-2xl border border-white/15 flex flex-col md:flex-row overflow-hidden text-[11px] tracking-[0.14em] uppercase">

          <div className="flex-1 bg-black/50 px-4 py-3 text-left border-b md:border-b-0 md:border-r border-white/10">
            <div className="text-gray-400">Stream</div>
            <div className="text-white font-semibold">Chemistry</div>
          </div>

          <div className="flex-1 bg-black/55 px-4 py-3 text-left border-b md:border-b-0 md:border-r border-white/10">
            <div className="text-gray-400">Level</div>
            <div className="text-white font-semibold">10th – 12th</div>
          </div>

          <div className="flex-1 bg-black/60 px-4 py-3 text-left border-b md:border-b-0 md:border-r border-white/10">
            <div className="text-gray-400">Mode</div>
            <div className="text-white font-semibold">Virtual Lab</div>
          </div>

          <button
            onClick={() => navigate(user ? "/lab" : "/auth")}
            className="bg-orange-400 hover:bg-orange-300 text-black font-semibold px-6 py-3 transition-all"
          >
            Start Lab →
          </button>
        </div>

      </div>
    </section>


      <section className="bg-black py-20 px-4 flex flex-col items-center">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.25em] uppercase text-gray-400">Signature Lab Missions</p>
        <h2 className="text-3xl md:text-4xl font-bold text-orange-200">EXPERIMENT ADVENTURES</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {/* CARD 1 */}
        <div className="flex flex-col items-center relative">
          <div className="w-80 h-[470px] bg-cover bg-center shadow-xl overflow-hidden border border-white/10 bg-[#0c0c0c] z-10 hover:border-orange-100 transition" style={{ backgroundImage: `url(${Acid_Base_Titration})` }}>
            <div className="absolute bottom-0 w-full h-full ml-10 flex flex-col justify-end">
              <button 
                type="button"
                onClick={() => navigate(user ? "/lab" : "/auth")}
                className="bg-orange-300 text-black w-[75%] py-3 text-[13px] font-semibold tracking-[0.16em] uppercase border border-white/20 hover:bg-orange-200">
                Acid-Base Titration →
              </button>
            </div>
          </div>
        </div>
        {/* CARD 2 */}
        <div className="flex flex-col items-center relative">
          <div className="w-80 h-[470px] bg-cover bg-center shadow-xl overflow-hidden border border-white/10 bg-[#0c0c0c] z-10 hover:border-orange-100 transition" style={{ backgroundImage: `url(${Salt_Analysis})` }}>
            <div className="absolute bottom-0 w-full h-full ml-10 flex flex-col justify-end">
              <button 
                type="button"
                onClick={() => navigate(user ? "/lab" : "/auth")}
                className="bg-orange-300 text-black w-[75%] py-3 text-[13px] font-semibold tracking-[0.16em] uppercase border border-white/20 hover:bg-orange-200">
                Salt Analysis →
              </button>
            </div>
          </div>
        </div>
        {/* CARD 3 */}
        <div className="flex flex-col items-center relative">
          <div className="w-80 h-[470px] bg-cover bg-center shadow-xl overflow-hidden border border-white/10 bg-[#0c0c0c] z-10 hover:border-orange-100 transition" style={{ backgroundImage: `url(${Electrolysis_of_Water})` }}>
            <div className="absolute bottom-0 w-full h-full ml-10 flex flex-col justify-end">
              <button 
                type="button"
                onClick={() => navigate(user ? "/lab" : "/auth")}
                className="bg-orange-300 text-black w-[75%] py-3 text-[13px] font-semibold tracking-[0.16em] uppercase border border-white/20 hover:bg-orange-200">
                Electrolysis of Water →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

      <section className="bg-[#050509] py-28 px-6 md:px-20 lg:px-32">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* 🔥 LEFT — Big Hero Image like BIO SUIT */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[650px]  overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <img 
              src={D_LAB_SIMULATION_ENGINE} 
              alt="3D Reactron Lab Engine"
              className="w-full h-[430px] md:h-[500px] object-cover"
            />
          </div>
        </div>
        {/* 🔥 RIGHT — Title + Description + Stats + CTA EXACT LIKE BIO SUIT */}
        <div>
          {/* Header */}
          <p className="text-[12px] tracking-[0.28em] text-gray-400 uppercase mb-2">Advanced System</p>

          <h2 className="text-4xl md:text-5xl font-black leading-tight text-white">
            3D LAB<br/>SIMULATION ENGINE
          </h2>

          {/* Gold underline same as screenshot */}
          <div className="w-24 h-[3px] bg-orange-300 mt-3 mb-6"></div>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-[16px] leading-[1.7] max-w-md">
            Reactron runs a real-time chemistry simulation core — flame colors, titrations, salt reactions and indicators behave as they would in an actual lab, optimized for exam-grade understanding and study.
          </p>


          {/* STATS — EXACT BIO SUIT CARD STYLE */}
          <div className="mt-10 flex flex-wrap gap-4">

            <div className="border border-white/15 px-6 py-4 text-center">
              <h3 className="text-3xl font-extrabold text-orange-200">4K</h3>
              <p className="text-[10px] tracking-widest text-gray-400 mt-1">VISUAL DETAIL</p>
            </div>

            <div className="border border-white/15 px-6 py-4 text-center">
              <h3 className="text-3xl font-extrabold text-orange-200">LIVE</h3>
              <p className="text-[10px] tracking-widest text-gray-400 mt-1">REACTION FEEDBACK</p>
            </div>

            <div className="border border-white/15 px-6 py-4 text-center">
              <h3 className="text-3xl font-extrabold text-orange-200">AI+</h3>
              <p className="text-[10px] tracking-widest text-gray-400 mt-1">GUIDED STEPS</p>
            </div>

          </div>

          {/* CTA UNDER STATS JUST LIKE SCREENSHOT */}
          <button 
            type="button"
            onClick={() => navigate("/lab")}
            className="mt-10 px-10 py-3 text-[13px] font-semibold tracking-[0.16em] uppercase
                      border border-white/20 hover:border-orange-300 transition duration-300">
            Learn More →
          </button>
        </div>
      </div>
    </section>
    <DownloadSection/>

    <section className="bg-black py-20 px-6 md:px-16 lg:px-32 border-t border-white/5">
    {/* HEADINGS */}
    <div className="text-center mb-10">
      <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-gray-400">
        Explore Other Domains
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
        CHEMISTRY UNIVERSE
      </h2>
    </div>
    {/* 🔥 ANIMATED TABS */}
    <div className="flex flex-wrap justify-center gap-5 sm:gap-8 md:gap-10 text-[9px] sm:text-xs tracking-[0.18em] uppercase mb-10">
      {Object.keys(domains).map((key) => (
        <motion.span
          key={key}
          onClick={() => setActive(key)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            color: active === key ? "#ffb15a" : "#d4d4d4",
            borderBottom: active === key ? "2px solid #ffb15a" : "2px solid transparent",
          }}
          transition={{ duration: 0.25 }}
          className="cursor-pointer pb-1"
        >
          {key}
        </motion.span>
      ))}
    </div>
    {/* CONTENT LAYOUT — NOW RESPONSIVE */}
    <div className="
        grid gap-12 items-center 
        md:grid-cols-[1.2fr_0.9fr]   /* desktop layout remains */
        grid-cols-1                 /* mobile stacks vertically */
        text-center md:text-left    /* center on mobile, left on desktop */
      "
    >
      {/* LEFT — TEXT CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="px-2 sm:px-0"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-4">
            {d.title}
          </h3>

          <p className="text-gray-300 text-[13px] sm:text-sm md:text-base leading-relaxed mb-6">
            {d.description}
          </p>

          {/* STATS — WRAP NICELY ON MOBILE */}
          <motion.div
            className="flex flex-wrap justify-center md:justify-start gap-4 mt-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } }
            }}
          >
            {d.stats.map((s, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                className="
                  px-6 py-4 min-w-[130px] sm:min-w-[150px]
                  border border-white/15 text-center
                  hover:border-orange-300 transition duration-300
                "
              >
                <h3 className="text-2xl sm:text-3xl font-extrabold text-orange-200">{s.value}</h3>
                <p className="text-[9px] sm:text-[10px] tracking-[0.25em] text-gray-400 mt-2 uppercase">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* RIGHT — IMAGE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={d.image}
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          transition={{ duration: 0.55 }}
          className="relative max-w-[300px] sm:max-w-[380px] md:max-w-full mx-auto"
        >
          <div className="rounded-full overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
            <img alt="domain" src={d.image} className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  </section>
   {/*  ABOUT US */}
    <section className="bg-[#050406] py-24 px-6 md:px-16 lg:px-20 border-t border-white/10">

      <div className="grid md:grid-cols-[1.5fr_1fr] gap-10 items-center">

        {/* IMAGE AREA */}
        <div className="flex w-full">

          {/* MOBILE SHOW ONLY THIS IMAGE */}
          <img 
            src={image}
            alt="Chemistry Practical Experiment"
            className="object-cover w-full h-[260px] md:w-[42%] md:mt-10 md:h-[320px]"
          />

          {/* HIDE ON MOBILE (SHOW DESKTOP) */}
          <img 
            src={banner4}
            alt="Virtual Lab Demonstration"
            className="hidden md:block object-cover w-[42%] h-[360px]"
          />
        </div>

        {/* RIGHT — TEXT SECTION (unchanged) */}
        <div className="text-white">
          <p className="text-[11px] tracking-[0.3em] text-gray-400 uppercase mb-3">
            OUR STORY • VISUALS TECH × REACTRON
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4">
            Building Chemistry <br/>
            Through <span className="text-orange-300 uppercase">Visualization</span>
          </h2>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            We bring <b>real experiment reactions</b> into a digital simulation —
            titrations, flame colors, electrolysis and precipitation behave exactly
            like real labs. Learn visually, safely and interactively.
          </p>
          <button type="button" 
            className="mt-8 px-7 py-3 text-sm rounded-full border border-white/25 hover:bg-white hover:text-black transition font-semibold">
            About Reactron →
          </button>
        </div>
      </div>

      {/* BOTTOM IMAGE ROW — HIDE ON MOBILE */}
      <div className="hidden md:flex items-center gap-3 w-full">
        
        <div className="flex w-1/2 gap-0">
          <img 
            src={banner3}
            alt="Chemistry Visual 1"
            className="w-1/2 h-[240px] object-cover"
          />
          <img 
            src={banner2}
            alt="Chemistry Visual 2"
            className="w-1/2 h-[300px] object-cover"
          />
        </div>
        {/* RIGHT BIG IMAGE */}
        <img 
          src={banner1}
          alt="Chemistry Lab Full Display"
          className="w-1/2 h-[240px] -mt-14 object-cover"
        />
      </div>
    </section>

    {/* =================== PLAN YOUR LAB TRIP =================== */}
      <section className="bg-[#060507] py-24 px-6 md:px-16 lg:px-32 border-t border-white/5 select-none">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[12px] tracking-[0.38em] uppercase text-gray-400 opacity-70">
            Before You Start
          </p>

          <h3 className="text-3xl md:text-4xl font-extrabold tracking-wide text-orange-200 mt-3 uppercase">
            Plan Your Lab Session
          </h3>
        </div>

        {/* 4-Step Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">

          {/* STEP 1 */}
          <div className="space-y-4">
            <Activity className="w-10 h-10 mx-auto text-orange-200/90 opacity-90" strokeWidth={1.4} />
            <h4 className="uppercase text-orange-200 font-semibold tracking-[0.25em] text-sm">
              Pick an Experiment
            </h4>
            <p className="text-[11px] text-gray-400/80 leading-relaxed tracking-[0.15em]">
              Choose a practical aligned <br /> with real lab standards.
            </p>
          </div>

          {/* STEP 2 */}
          <div className="space-y-4">
            <Route className="w-10 h-10 mx-auto text-orange-200/90 opacity-90" strokeWidth={1.4} />
            <h4 className="uppercase text-orange-200 font-semibold tracking-[0.25em] text-sm">
              Follow the Flow
            </h4>
            <p className="text-[11px] text-gray-400/80 leading-relaxed tracking-[0.15em]">
              Guided step-by-step like <br /> an actual lab instructor.
            </p>
          </div>

          {/* STEP 3 */}
          <div className="space-y-4">
            <BarChart3 className="w-10 h-10 mx-auto text-orange-200/90 opacity-90" strokeWidth={1.4} />
            <h4 className="uppercase text-orange-200 font-semibold tracking-[0.25em] text-sm">
              Check Your Scores
            </h4>
            <p className="text-[11px] text-gray-400/80 leading-relaxed tracking-[0.15em]">
              Track timing, accuracy & <br /> conceptual understanding.
            </p>
          </div>

          {/* STEP 4 */}
          <div className="space-y-4">
            <Sparkles className="w-10 h-10 mx-auto text-orange-200/90 opacity-90" strokeWidth={1.4} />
            <h4 className="uppercase text-orange-200 font-semibold tracking-[0.25em] text-sm">
              Export Reports
            </h4>
            <p className="text-[11px] text-gray-400/80 leading-relaxed tracking-[0.15em]">
              Generate clean summary PDFs <br /> for revision or submission.
            </p>
          </div>

        </div>
      </section>
     {/* =================== FOOTER — PLANET + VIDEO BG STYLE (UPGRADED) =================== */}
    <footer className="relative w-full overflow-hidden text-center select-none">

      {/* 🔥 BACKGROUND VIDEO — HEIGHT INCREASED */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-[500px] md:h-[650px] object-cover opacity-[0.32]"
      >
        <source src={footer} type="video/mp4" />
      </video>

      {/* DARK GRADIENT LAYER */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* BRAND NAME — CENTERED MORE CLEARLY */}
      <h2 className="relative z-10 text-2xl md:text-3xl tracking-[0.45em] text-gray-200 font-light mt-[200px] md:mt-[260px] mb-10">
        REACTRON
      </h2>

      {/* MENU LINKS — CENTER, SPACED ELEGANTLY */}
      <div className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-12 text-[11px] md:text-[12px] tracking-[0.32em] uppercase text-gray-400 mb-12">
        <a onClick={() => handleLabAccess()} className="hover:text-orange-200 transition">Technology</a>
        <a onClick={() => handleLabAccess()} className="hover:text-orange-200 transition">My Lab</a>
        <a onClick={() => handleLabAccess()} className="hover:text-orange-200 transition">Support</a>
      </div>

      {/* COPYRIGHT — CLEAN + CENTER */}
      <p className="relative z-10 text-[10px] tracking-[0.28em] text-gray-500 pb-16">
        © {new Date().getFullYear()} Reactron · All Rights Reserved
      </p>

    </footer>

    </div>
  );
};

export default Index;
