import React from "react";
import Layout from "./componnets/layout";
import HeroSection from "./componnets/heroSection";


export default function Home() {
  return (
    <div>
      <main>
        <Layout>
          <HeroSection />
        </Layout>
      </main>
    </div>
  );
}
