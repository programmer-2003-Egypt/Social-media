import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "./supabase";
import { Section, Glass, Title } from "./layouts";
import { FaInfoCircle, FaCheckCircle, FaTimesCircle, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import {
  TableContainer,
  StyledTable,
  Th,
  Td,
  Tr,
  TooltipWrapper,
  TooltipText,
  SearchInput
} from "./layouts";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Tooltip component
const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <TooltipWrapper onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && <TooltipText>{text}</TooltipText>}
    </TooltipWrapper>
  );
};

// Status badge
const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "completed": return <FaCheckCircle style={{ color: "green" }} />;
    case "in progress": return <FaInfoCircle style={{ color: "#1890ff" }} />;
    case "not started": return <FaTimesCircle style={{ color: "red" }} />;
    default: return "—";
  }
};

export default function TrainingSection() {
  const [training, setTraining] = useState([]);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchTraining = async () => {
      const { data, error } = await supabase.from("training").select("*").order("id");
      if (error) console.error(error);
      else setTraining(data);
    };
    fetchTraining();
  }, []);

  const displayedTraining = useMemo(() => {
    let filtered = [...training];

    // Powerful search: search in course, provider, AND text inside ()
    if (search) {
      filtered = filtered.filter(t => {
        const descriptionMatch = t.description?.match(/\(([^)]+)\)/)?.[1] || "";
        return (
          (t.course || "").toLowerCase().includes(search.toLowerCase()) ||
          (t.provider || "").toLowerCase().includes(search.toLowerCase()) ||
          descriptionMatch.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const valA = a[sortColumn] || "";
      const valB = b[sortColumn] || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [training, search, sortColumn, sortOrder]);

  const handleSort = col => {
    if (sortColumn === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortColumn(col); setSortOrder("asc"); }
  };

  return (
    <Section id="training">
      <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <Glass>
          <Title>Training & Courses</Title>

          {/* Animated search */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <SearchInput
              type="text"
              placeholder="Search by course, provider, or text in ()..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>

          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  {["course", "provider", "period", "level", "description"].map(col => (
                    <Th key={col} onClick={() => handleSort(col)}>
                      {col.charAt(0).toUpperCase() + col.slice(1)}{" "}
                      {sortColumn === col ? (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedTraining.map((t, idx) => {
                  // FIX: `extractedText` is now declared inside the loop where `t` is defined.
                  const extractedText = t.description?.match(/\(([^)]+)\)/)?.[1] || "";

                  return (
                    <Tr key={t.id} index={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                      <Td maxWidth="200px">{t.course}</Td>
                      <Td maxWidth="150px">
                        {t.provider} {extractedText && `(${extractedText})`}
                      </Td>
                      <Td maxWidth="100px">{t.period || "—"}</Td>
                      <Td maxWidth="100px">{t.level || "—"}</Td>
                      <Td maxWidth="300px">
                        {t.description || "—"}{" "}
                        {t.description && <Tooltip text={t.description}><FaInfoCircle style={{ color: "#888", cursor: "pointer", marginLeft: 5 }} /></Tooltip>}
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </StyledTable>
          </TableContainer>
        </Glass>
      </motion.div>
    </Section>
  );
}