import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { supabaseUrl, supabaseAnonKey };
}

async function getContributor(id) {
  const config = getSupabaseConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  const client = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
  const { data } = await client
    .from("community_contributors")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function generateStaticParams() {
  const config = getSupabaseConfig();
  if (!config) return [];
  const cookieStore = await cookies();
  const client = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
  const { data: contributors } = await client
    .from("community_contributors")
    .select("id");
  return (contributors || []).map((c) => ({ id: String(c.id) }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const contributor = await getContributor(id);
  if (!contributor) return { title: "Contributor Not Found" };
  return {
    title: `${contributor.name} | AlgoBuddy Community`,
    description: contributor.bio || `${contributor.name} — Community Contributor at AlgoBuddy`,
    openGraph: contributor.avatar_url ? { images: [{ url: contributor.avatar_url }] } : undefined,
  };
}

export default async function ContributorProfilePage({ params }) {
  const { id } = await params;
  const contributor = await getContributor(id);

  if (!contributor) notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/community"
          className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:underline mb-8"
        >
          ← Back to Community
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white mb-4">
              {contributor.avatar_url ? (
                <img
                  src={contributor.avatar_url}
                  alt={contributor.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                contributor.name.charAt(0).toUpperCase()
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {contributor.name}
            </h1>

            {contributor.role && (
              <p className="text-purple-600 dark:text-purple-400 font-medium mt-1">
                {contributor.role}
              </p>
            )}

            {contributor.bio && (
              <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-md">
                {contributor.bio}
              </p>
            )}

            {contributor.github_url && (
              <a
                href={contributor.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="text-sm">GitHub Profile</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contributor.projects_count ?? 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Projects</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contributor.followers_count ?? 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contributor.following_count ?? 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Following</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              disabled
              className="px-6 py-2 bg-purple-600 text-white rounded-lg opacity-50 cursor-not-allowed"
              title="Follow feature coming soon"
            >
              Follow
            </button>
            <p className="text-xs text-gray-400 mt-1">Follow feature coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
