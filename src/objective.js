// ObjectiveSection.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "./supabase";
import { Section, Glass, Title, Sub } from "./layouts"; // Adjust import paths as needed

export default function ObjectiveSection() {
  const [objective, setObjective] = useState("");

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  useEffect(() => {
    const fetchObjective = async () => {
      const { data, error } = await supabase
        .from("objective")
        .select("content")
        .limit(1)
        .single();

      if (error) console.error("Error fetching objective:", error);
      else setObjective(data?.content || "");
    };

    fetchObjective();
  }, []);

  return (
    <Section id="objective">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Glass>
          <Title>Objective</Title>
          <Sub>{objective || "Loading objective..."}</Sub>
        </Glass>
      </motion.div>
    </Section>
  );
}
