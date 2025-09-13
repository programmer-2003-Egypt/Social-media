// EducationSection.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "./supabase";
import {
  Section,
  Glass,
  Title,
  Sub,
  Tag,
  Timeline,
  Titem
} from "./layouts"; // Adjust import paths as needed

export default function EducationSection() {
  const [education, setEducation] = useState([]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  useEffect(() => {
    const fetchEducation = async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("id");

      if (error) console.error("Error fetching education:", error);
      else setEducation(data);
    };

    fetchEducation();
  }, []);

  return (
    <Section id="education">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Glass>
          <Title>Education</Title>
          <Timeline>
            {education.map(e => (
              <Titem key={e.id}>
                <Sub><strong>{e.institution}</strong></Sub>
                <Sub>{e.degree} — {e.year}</Sub>
                <Tag>Grade: {e.grade}</Tag>
              </Titem>
            ))}
          </Timeline>
        </Glass>
      </motion.div>
    </Section>
  );
}
