"use client";

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 36,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </M>
  );
}

/** Título com linhas que sobem de trás de uma máscara. */
export function MaskLines({ lines, className, lineClassName }: { lines: ReactNode[]; className?: string; lineClassName?: string[] }) {
  const reduce = useReducedMotion();
  const container: Variants = { show: { transition: { staggerChildren: 0.09 } } };
  const line: Variants = {
    hidden: { y: "110%", rotate: 2 },
    show: { y: "0%", rotate: 0, transition: { duration: 1, ease } },
  };
  return (
    <motion.span
      className={className}
      variants={container}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em] pr-[0.08em]">
          <motion.span variants={line} className={`block origin-bottom-left ${lineClassName?.[i] ?? ""}`}>
            {l}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Imagem que se revela de baixo para cima e desliza com o scroll. */
export function ParallaxImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  strength = 60,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  strength?: number;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-strength, strength]);
  return (
    <motion.div
      ref={ref}
      className={`${className.split(" ").includes("absolute") ? "" : "relative"} overflow-hidden ${className}`}
      initial={reduce ? false : { clipPath: "inset(100% 0 0 0)" }}
      whileInView={{ clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.2, ease }}
    >
      <motion.div style={{ y }} className="absolute inset-[-80px_0]">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </motion.div>
    </motion.div>
  );
}

/** Texto riscado quando entra na tela (risca cada linha, mesmo quando o texto quebra). */
export function Strike({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="[box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
      style={{
        backgroundImage: "linear-gradient(var(--color-orange), var(--color-orange))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 58%",
      }}
      initial={reduce ? false : { backgroundSize: "0% 0.13em", color: "rgb(244 241 234 / 1)" }}
      whileInView={{ backgroundSize: "100% 0.13em", color: "rgb(244 241 234 / 0.4)" }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.span>
  );
}

export function Marquee({
  items,
  reverse,
  className = "",
  itemClassName = "",
  speed = 38,
  separator = "✦",
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  speed?: number;
  separator?: string;
}) {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((t, i) => (
        <span key={i} className={`flex items-center whitespace-nowrap ${itemClassName}`}>
          {t}
          <span className="mx-6 text-[0.6em] opacity-70">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`flex overflow-hidden ${className}`}>
      <div
        className={`flex w-max ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}
        style={{ ["--marquee-speed" as string]: `${speed}s` }}
      >
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
