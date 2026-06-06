"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_CONTRIBUTORS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Contributor ${i + 1}`,
  avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=contributor${i + 1}`,
  role: "Contributor",
  github_url: "https://github.com",
}));

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const contributorVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function ContributorSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="skeleton-shimmer h-16 w-16 rounded-full" />
      <div className="skeleton-shimmer h-4 w-24" />
      <div className="skeleton-shimmer h-3 w-20" />
    </div>
  );
}

function ContributorCard({ contributor }) {
  return (
    <motion.a
      href={contributor.github_url}
      target="_blank"
      rel="noopener noreferrer"
      variants={contributorVariants}
      aria-label={`${contributor.name}'s GitHub profile`}
      className="card-surface flex flex-col items-center gap-3 p-4 transition-shadow duration-[var(--motion-fast)] hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
    >
      <Image
        src={contributor.avatar_url}
        alt={`${contributor.name}'s avatar`}
        width={64}
        height={64}
        unoptimized
        className="h-16 w-16 rounded-full object-cover"
      />
      <span className="text-sm font-semibold text-[var(--udemy-text)] dark:text-[var(--udemy-dark-text)]">
        {contributor.name}
      </span>
      <span className="text-xs text-[var(--color-muted)]">{contributor.role}</span>
    </motion.a>
  );
}

export default function ContributorsSection() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchContributors() {
      try {
        const res = await fetch("/api/community/contributors?limit=12&offset=0");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) {
          setContributors(data.contributors || []);
          setTotalCount(data.total || data.contributors?.length || 0);
        }
      } catch {
        if (!cancelled) {
          setContributors(MOCK_CONTRIBUTORS);
          setTotalCount(80);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchContributors();
    return () => { cancelled = true; };
  }, []);

  const displayed = showAll ? contributors : contributors.slice(0, 12);

  return (
    <section className="section-app">
      <div className="container-app">
        <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--udemy-text)] dark:text-[var(--udemy-dark-text)]">
              Contributors
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Awesome developers who contribute to AlgoBuddy
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--udemy-purple)]/10 px-3 py-1 text-sm font-medium text-[var(--udemy-purple)]">
            <Users size={14} />
            {totalCount}+ contributors and counting
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ContributorSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={showAll ? "all" : "initial"}
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6"
            >
              {displayed.map((c) => (
                <ContributorCard key={c.id} contributor={c} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && contributors.length > 12 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              aria-live="polite"
              className="btn-base border-2 border-[var(--udemy-purple)] text-[var(--udemy-purple)] hover:bg-[var(--udemy-purple)] hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
            >
              <Users size={16} />
              {showAll ? "Show Less" : `View All Contributors (${contributors.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
