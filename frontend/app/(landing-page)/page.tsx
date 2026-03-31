import Header from "@/features/landing-page/components/Header";
import About from "@/features/landing-page/components/About";
import Hero from "@/features/landing-page/components/Hero";
import ValueProposition from "@/features/landing-page/components/ValueProposition";
import React from "react";

export default function page() {
  return (
    <div>
      <Header></Header>
      <Hero></Hero>
      <ValueProposition></ValueProposition>
      <About></About>
    </div>
  );
}
