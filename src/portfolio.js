import React, { useEffect, useRef, useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import * as d3 from "d3"; // ✅ D3 import

import {
  FaLinkedin,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaGithub,
  FaExternalLinkAlt,
  FaCode,
  FaGamepad,
  FaClock,
  FaBolt,
  FaChevronUp
} from "react-icons/fa";

import {
  Page,
  ReadMore,
  Shell,
  CardContainer,
  CardImage,
  CardTitle,
  CardDescription,
  TopNav,
  ProgressBadge,
  TagWrapper,
  TopBar,
  SocialLink,
  SocialContainer,
  NavLinks,
  Toggle,
  Section,
  Title,
  Sub,
  Grid,
  Col,
  Tag,
  Card,
  Timeline,
  Titem,
  LinkCardWrap,
  Fab,
  Glass,
  Progress
} from "./layouts";
import LanguagesSection from "./languages";
import SkillChart from "./chart"; // adjust path
import HeroSection from "./heroSection";
import { SUPABASE_URL,SUPABASE_KEY,supabase } from "./supabase";
import { darkTheme, lightTheme } from "./theme";
import TrainingSection from "./training";
import ProjectsSection from "./projectSection";
import EducationSection from "./Education";
import ObjectiveSection from "./objective";
import SkillsSection from "./skills";



// ====== Hooks ======
function useThemeMode() {
  const [dark, setDark] = useState(true);
  const theme = dark ? darkTheme : lightTheme;
  const toggle = () => setDark(d => !d);
  return { theme, dark, toggle };
}

const useInView = (opts = { threshold: 0.2 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), opts);
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [opts]);
  return { ref, inView };
};

// ====== Main ======
export default function Portfolio() {
  const { theme, dark, toggle } = useThemeMode();
  const [modal, setModal] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [training, setTraining] = useState([]);
  const [objective, setObjective] = useState("");
  const [languages, setLanguages] = useState([]);
  const [expanded, setExpanded] = useState(false);


  const progressRef = useRef(null);
  const heroImgRef = useRef(null);
  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
  
  
  useEffect(() => {
    const fetchData = async () => {
      const [projectsData, tagsData, skillsData, educationData, trainingData, objectiveData, languagesData] =
        await Promise.all([
          supabase.from("projects").select("*").order("id"),
          supabase.from("tags").select("*").order("id"),
          supabase.from("skills").select("*").order("id"),
          supabase.from("education").select("*").order("id"),
          supabase.from("training").select("*").order("id"),
          supabase.from("objective").select("content"),
          supabase.from("languages").select("*").order("id"),
        ]);

      if (projectsData.data) setProjects(projectsData.data);
      if (tagsData.data) setTags(tagsData.data.map(t => t.name));
      if (skillsData.data) setSkills(skillsData.data.map(s => ({ ...s, level: s.level || 10 })));
      if (educationData.data) setEducation(educationData.data);
      if (trainingData.data) setTraining(trainingData.data);
      if (objectiveData.data) setObjective(objectiveData.data[0]?.content ?? "");
      if (languagesData.data) setLanguages(languagesData.data);
    };
    fetchData();
  }, []);

  // GSAP Scroll
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const update = () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (progressRef.current) progressRef.current.style.width = `${scrolled}%`;
    };
    update();
    window.addEventListener("scroll", update);
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Page>
        <TopNav>
          <TopBar>
            <NavLinks>{["home","objective","education","training","projects","skills","languages"].map(id => <a key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}>{id}</a>)}</NavLinks>
            <SocialContainer>
              <SocialLink href="mailto:youssefhakim45@gmail.com"><FaEnvelope /></SocialLink>
              <SocialLink href="https://www.linkedin.com/in/yousef-abdelhakim-121890242/" target="_blank"><FaLinkedin /></SocialLink>
              <SocialLink href="https://github.com/dashboard" target="_blank"><FaGithub /></SocialLink>
            </SocialContainer>
          </TopBar>
          <Progress ref={progressRef} />
        </TopNav>

        
    <Shell>
    <HeroSection />
    <ObjectiveSection />
      <EducationSection />
      {/* TRAINING */}
      <TrainingSection /> {/* no props */}

      <ProjectsSection />

      {/* SKILLS */}
      <SkillsSection />

      {/* LANGUAGES */}
      <LanguagesSection />

    </Shell>

        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "grid", placeItems: "center", zIndex: 60, padding: 24 }}>
            <motion.img src={modal} alt="Preview" initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 16 }} />
          </motion.div>
        )}

        <Fab onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top"><FaChevronUp /></Fab>
      </Page>
    </ThemeProvider>
  );
}
