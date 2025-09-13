import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { supabase } from "./supabase"; // your Supabase client
import { Section, Glass, Grid, Col, Title, Sub, Tag } from "./layouts"; // adjust path

// ====== Assets ======
import profilePic from "./Assets/Youssef Abdelhakim.png";


const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function HeroSection() {
  const [tags, setTags] = useState([]);
  const [theme, setTheme] = useState({
    border: "#ccc",
    glow: "0 0 15px rgba(0,0,0,0.2)"
  });

  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase.from("tags").select("*").order("id");
      if (error) {
        console.error("Error fetching tags:", error);
      } else {
        setTags(data.map(t => t.name));
      }
    };
    fetchTags();
  }, []);

  return (
    <Section id="home">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Glass>
          <Grid>
            <Col span={7}>
              <Title>Youssef Abdelhakim Fekry</Title>
              <Sub style={{ fontWeight: 700 }}>MERN Stack Developer</Sub>
              <Sub><FaMapMarkerAlt /> Zagazig, Sharqia, Egypt</Sub>
              <Sub><FaPhoneAlt /> 01063856210</Sub>
              <Sub><FaEnvelope /> yousefhakim45@gmail.com</Sub>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                {tags.map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </Col>

            <Col span={5}>
              <img
                src={profilePic}
                alt="Youssef"
                style={{
                  width: "100%",
                  borderRadius: 20,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.glow
                }}
              />
            </Col>
          </Grid>
        </Glass>
      </motion.div>
    </Section>
  );
}
