// LanguagesSection.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "./supabase";
import { Section, Glass, Title, Tag } from "./layouts"; // adjust paths

export default function LanguagesSection() {
  const [languages, setLanguages] = useState([]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      const { data, error } = await supabase.from("languages").select("*").order("id");
      if (error) console.error("Error fetching languages:", error);
      else setLanguages(data);
    };
    fetchLanguages();
  }, []);

  return (
    <Section id="languages">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Glass>
          <Title>Languages</Title>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {languages.map(l => (
              <Tag key={l.id}>{l.language} — {l.level}</Tag>
            ))}
          </div>
        </Glass>
      </motion.div>
    </Section>
  );
}
