import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const SkillChart = ({ skills }) => {
  const ref = useRef();

  useEffect(() => {
    if (!skills.length) return;

    const container = d3.select(ref.current);

    const drawChart = () => {
      container.selectAll("*").remove(); // clear previous chart

      const bounds = container.node().getBoundingClientRect();
      const width = bounds.width || 400;
      const margin = { top: 20, right: 20, bottom: 20, left: 0 };

      // Measure longest skill name for dynamic left margin
      const tempSVG = container.append("svg").attr("visibility", "hidden");
      let maxLabelWidth = 0;
      skills.forEach(skill => {
        const text = tempSVG.append("text").text(skill.name).style("font-size", "12px");
        const w = text.node().getComputedTextLength();
        if (w > maxLabelWidth) maxLabelWidth = w;
        text.remove();
      });
      tempSVG.remove();
      margin.left = maxLabelWidth + 20;

      const height = skills.length * 35; // dynamic height

      const svg = container
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // X scale
      const x = d3.scaleLinear()
        .domain([0, d3.max(skills, d => d.level) || 10])
        .range([0, width - margin.left - margin.right]);

      // Y scale
      const y = d3.scaleBand()
        .domain(skills.map(d => d.name))
        .range([0, height])
        .padding(0.3);

      // Bars
      svg.selectAll(".bar")
        .data(skills)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.name))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.level))
        .attr("fill", "#4CAF50")
        .on("mouseover", function () { d3.select(this).attr("fill", "#45a049"); })
        .on("mouseout", function () { d3.select(this).attr("fill", "#4CAF50"); });

      // Y axis labels
      svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#333");

      // Level numbers
      svg.selectAll(".label")
        .data(skills)
        .enter()
        .append("text")
        .attr("x", d => x(d.level) + 5)
        .attr("y", d => y(d.name) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text(d => d.level)
        .style("font-size", "12px")
        .style("fill", "#333");
    };

    drawChart();

    // Redraw on window resize
    window.addEventListener("resize", drawChart);
    return () => window.removeEventListener("resize", drawChart);

  }, [skills]);

  return <svg ref={ref} style={{ width: "100%", height: "auto" }} />;
};

export default SkillChart;
