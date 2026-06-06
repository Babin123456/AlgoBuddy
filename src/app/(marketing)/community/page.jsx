"use client";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/app/components/footer";
import AnimatedCounter from "@/app/components/community/AnimatedCounter";
import UserProfileCard from "@/app/components/community/UserProfileCard";
import CoreTeamSection from "@/app/components/community/CoreTeamSection";
import ContributorsSection from "@/app/components/community/ContributorsSection";
import CommunityBlogFeed from "@/app/components/community/CommunityBlogFeed";
import { HiUsers, HiChat, HiCode } from "react-icons/hi";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const communityStats = [
  { icon: HiUsers, label: "Active Members", value: 12847 },
  { icon: HiCode, label: "Problems Solved", value: 45230 },
  { icon: HiChat, label: "Discussions", value: 3156 },
];

function StatSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl bg-surface-50 dark:bg-neutral-800 border border-surface-200 dark:border-neutral-700 shadow-sm">
      <div className="skeleton-shimmer w-12 h-12 rounded-lg" />
      <div className="space-y-2">
        <div className="skeleton-shimmer h-7 w-16" />
        <div className="skeleton-shimmer h-4 w-24" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-surface-50 dark:bg-neutral-800 border border-surface-200 dark:border-neutral-700 shadow-sm">
      <div className="skeleton-shimmer h-5 w-16 mb-3" />
      <div className="flex items-center gap-4 mb-4">
        <div className="skeleton-shimmer w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-24" />
          <div className="skeleton-shimmer h-3 w-20" />
        </div>
      </div>
      <div className="skeleton-shimmer h-4 w-full mb-4" />
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-full" />
        <div className="skeleton-shimmer h-4 w-full" />
        <div className="skeleton-shimmer h-4 w-full" />
      </div>
    </div>
  );
}

function CoreTeamSkeleton() {
  return (
    <div className="rounded-xl bg-surface-50 dark:bg-neutral-800 border border-surface-200 dark:border-neutral-700 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="skeleton-shimmer w-10 h-10 rounded-lg" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-6 w-28" />
          <div className="skeleton-shimmer h-4 w-52" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex lg:flex-col items-center lg:text-center gap-4 lg:gap-3 p-4 rounded-lg bg-white dark:bg-neutral-700/50 border border-surface-200 dark:border-neutral-700">
            <div className="skeleton-shimmer w-12 h-12 lg:w-16 lg:h-16 rounded-full" />
            <div className="min-w-0 flex-1 lg:flex-none w-full space-y-2">
              <div className="skeleton-shimmer h-4 w-24 mx-auto" />
              <div className="skeleton-shimmer h-3 w-16 mx-auto" />
              <div className="skeleton-shimmer h-3 w-32 mx-auto hidden lg:block" />
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="skeleton-shimmer w-7 h-7 rounded-full" />
                <div className="skeleton-shimmer w-7 h-7 rounded-full" />
                <div className="skeleton-shimmer w-7 h-7 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributorsGridSkeleton() {
  return (
    <section className="section-app">
      <div className="container-app">
        <div className="mb-8">
          <div className="skeleton-shimmer h-8 w-40 mb-2" />
          <div className="skeleton-shimmer h-4 w-64" />
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4">
              <div className="skeleton-shimmer h-16 w-16 rounded-full" />
              <div className="skeleton-shimmer h-4 w-24" />
              <div className="skeleton-shimmer h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogFeedSkeleton() {
  return (
    <section className="section-app">
      <div className="container-app">
        <div className="mb-6">
          <div className="skeleton-shimmer h-8 w-48 mb-2" />
          <div className="skeleton-shimmer h-4 w-72" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-surface flex flex-col overflow-hidden">
              <div className="flex-1 p-5 space-y-3">
                <div className="skeleton-shimmer h-5 w-20 rounded-full" />
                <div className="skeleton-shimmer h-5 w-full" />
                <div className="skeleton-shimmer h-4 w-3/4" />
                <div className="skeleton-shimmer h-4 w-full" />
                <div className="skeleton-shimmer h-4 w-2/3" />
              </div>
              <div className="flex items-center gap-3 border-t border-[var(--color-border)] px-5 py-3">
                <div className="skeleton-shimmer h-7 w-7 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton-shimmer h-3 w-24" />
                  <div className="skeleton-shimmer h-2 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CommunityPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="min-h-screen bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="mb-10 space-y-2">
            <div className="skeleton-shimmer h-10 w-40" />
            <div className="skeleton-shimmer h-5 w-72" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[1, 2, 3].map((i) => <StatSkeleton key={i} />)}
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-80 flex-shrink-0">
              <ProfileSkeleton />
            </aside>
            <main className="flex-1 min-w-0 space-y-12">
              <CoreTeamSkeleton />
              <ContributorsGridSkeleton />
              <BlogFeedSkeleton />
            </main>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white dark:bg-neutral-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16"
      >
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl font-bold text-surface-900 dark:text-white">
            Community
          </h1>
          <p className="mt-2 text-surface-500 dark:text-surface-400 text-lg">
            Connect, share, and grow with fellow DSA learners.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {communityStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-5 rounded-xl bg-surface-50 dark:bg-neutral-800 border border-surface-200 dark:border-neutral-700 shadow-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light">
                <stat.icon className="w-6 h-6" />
              </div>
              <AnimatedCounter value={stat.value} label={stat.label} />
            </div>
          ))}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            variants={itemVariants}
            className="w-full lg:w-80 flex-shrink-0"
          >
            <div className="lg:sticky lg:top-28 space-y-6">
              <Suspense fallback={<ProfileSkeleton />}>
                <UserProfileCard stats={{ projects: 12, followers: 48, following: 24 }} />
              </Suspense>
            </div>
          </motion.aside>

          <motion.main variants={itemVariants} className="flex-1 min-w-0">
            <div className="space-y-12">
              <Suspense fallback={<CoreTeamSkeleton />}>
                <CoreTeamSection />
              </Suspense>
              <Suspense fallback={<ContributorsGridSkeleton />}>
                <ContributorsSection />
              </Suspense>
              <Suspense fallback={<BlogFeedSkeleton />}>
                <CommunityBlogFeed />
              </Suspense>
            </div>
          </motion.main>
        </div>
      </motion.div>

      <Footer />
    </section>
  );
}
