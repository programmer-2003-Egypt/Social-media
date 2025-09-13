import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay"; 
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Swal from "sweetalert2";

import { supabase } from "./supabase";
import {
  Section,
  Glass,
  Title,
  ProgressBadge,
  CardContainer,
  CardImage,
  CardTitle,
  CardDescription,
  ReadMore,
  Col,
  Card
} from "./layouts";

import { FaCode, FaClock, FaGamepad, FaBolt } from "react-icons/fa";

// ===== Import local images =====
import CalcImg from "./Assets/Calc.png";
import ClockImg from "./Assets/Clock.png";
import TicTacToeImg from "./Assets/Tic-Tac-Toe.png";
import WebImage from "./Assets/web.png";

const imageMap = {
  calc: CalcImg,
  clock: ClockImg,
  "tic-tac-toe": TicTacToeImg
};

// ===== Tilt Hook =====
const useTilt = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateX(${py * -8}deg) rotateY(${px * 8}deg) scale(1.05)`;
    };

    const onLeave = () => (el.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)");

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return { ref };
};

// ===== TiltCard Component =====
const TiltCard = ({ project, index, total }) => {
  const { ref } = useTilt();
  const [expanded, setExpanded] = useState(false);

  const icons = {
    FaCode: <FaCode />,
    FaClock: <FaClock />,
    FaGamepad: <FaGamepad />,
    FaBolt: <FaBolt />
  };

  const handleReadMore = (e) => {
    e.preventDefault();
    setExpanded(!expanded);

    // Optional: Show SweetAlert with full content
    if (!expanded) {
      Swal.fire({
        title: project.title,
        html: `<p>${project.description || "No description available."}</p>`,
        icon: "info",
        confirmButtonText: "Close"
      });
    }
  };

  return (
    <Col span={4}>
      <Card ref={ref} whileHover={{ y: -6 }} style={{ position: "relative" }}>
        {project.tag && <span className="badge">{project.tag}</span>}

        <CardContainer>
          <ProgressBadge>{index + 1} / {total}</ProgressBadge>
          <CardImage src={imageMap[project.image] || WebImage} alt={project.title} />
          <CardTitle>{icons[project.icon] || <FaCode />} {project.title}</CardTitle>

          <CardDescription
            expanded={expanded}
            hoverable
            style={{
              display: "-webkit-box",
              WebkitLineClamp: expanded ? "none" : 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {project.description || "No description available."}
          </CardDescription>

         
        </CardContainer>
      </Card>
    </Col>
  );
};

// ===== ProjectsSection Component =====
export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from("projects").select("*").order("id");
      if (error) console.error("Error fetching projects:", error);
      else setProjects(data);
    };
    fetchProjects();
  }, []);

  return (
    <Section id="projects">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Glass>
          <Title>Projects</Title>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000 }}
            loop
            style={{ padding: "20px" }}
          >
            {projects.map((p, idx) => (
              <SwiperSlide key={p.id}>
                <TiltCard project={p} index={idx} total={projects.length} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Glass>
      </motion.div>
    </Section>
  );
}
