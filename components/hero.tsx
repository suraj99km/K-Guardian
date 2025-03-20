"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Hero Image with Dark Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="h-full w-full"
        >
          <Image
            src="/iimk-aerial-view.jpg"
            alt="IIMK Aerial View"
            layout="fill"
            objectFit="cover"
            className="opacity-70"
            priority
          />
        </motion.div>
      </div>

      {/* Animated Particles for Ambient Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleBackground />
      </div>

      {/* Overlay Content */}
      <div className="relative flex flex-col items-center text-center px-6 text-white z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl font-extrabold mt-4 tracking-tight"
        >
          Ensuring Safety at IIM Kozhikode
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg mt-4 max-w-2xl font-semibold bg-black/20 backdrop-blur-sm rounded-xl p-4 shadow-lg"
        >
          Report incidents instantly and keep the campus secure.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/report"
            className="mt-6 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg transition duration-300 hover:bg-gray-700 inline-block"
          >
            Report an Incident
          </Link>
        </motion.div>
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-6 text-sm font-medium tracking-wide italic text-gray-300"
      >
        "Vigilance, Safety, Action."
      </motion.p>
    </div>
  );
}

// Particle Background Component
function ParticleBackground() {
  // Create an array of particles with random positions
  const particles = Array.from({ length: 30 }).map((_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}