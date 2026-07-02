import Header from "@/features/landing-page/components/Header";
import About from "@/features/landing-page/components/About";
import Contact from "@/features/landing-page/components/Contact";
import Footer from "@/features/landing-page/components/Footer";
import Hero from "@/features/landing-page/components/Hero";
import Services from "@/features/landing-page/components/Services";
import Testimonial from "@/features/landing-page/components/Testimonial";
import TopOutfits from "@/features/landing-page/components/TopOutfits";
import ValueProposition from "@/features/landing-page/components/ValueProposition";
import React from "react";

export default function page() {
  return (
    <div>
      <Header></Header>
      <Hero></Hero>
      <ValueProposition></ValueProposition>
      <About></About>
      <Services></Services>
      <TopOutfits></TopOutfits>
      <Testimonial></Testimonial>
      <Contact></Contact>
      <Footer></Footer>
    </div>
  );
}
