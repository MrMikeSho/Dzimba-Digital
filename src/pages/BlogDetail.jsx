import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "@/api/client";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const posts = await apiClient.entities.BlogPost.filter({ slug }, "-created_date", 1);
      setPost(posts[0] || null);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto text-center">
        <p className="text-muted-foreground mb-8">Article not found</p>
        <Link to="/blog" className="ghost-btn inline-block">
          Back to Insights
        </Link>
      </div>
    );
  }

  // Fall back to the excerpt if a post has no body text.
  const body = post.content || post.excerpt || "";

  return (
    <div className="pt-28 md:pt-32 pb-24">
      <section className="px-6 md:px-12 max-w-[900px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 mb-8 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Insights
          </Link>

          <h1 className="font-display text-display-md font-light mt-3 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mb-12 font-body text-sm text-muted-foreground">
            {post.author_name && <span>{post.author_name}</span>}
            {post.read_time && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{post.read_time} min read</span>
              </>
            )}
          </div>
        </motion.div>

        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto rounded-sm"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-display text-foreground leading-relaxed space-y-6"
        >
          <div className="whitespace-pre-wrap text-lg">{body}</div>
        </motion.div>
      </section>
    </div>
  );
}
