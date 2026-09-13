import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { usePlaylistStore } from "../store/usePlaylistStore";

const PlaylistDetailsPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const {
    currentPlaylist,
    getPlaylistDetails,
    removeProblemFromPlaylist,
    isLoading,
  } = usePlaylistStore();

  useEffect(() => {
    if (playlistId) {
      getPlaylistDetails(playlistId);
    }
  }, [playlistId]);

  const handleRemoveProblem = async (problemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this problem from the playlist?"
    );

    if (!confirmed) return;

    await removeProblemFromPlaylist(playlistId, [problemId]);
  };

  if (isLoading && !currentPlaylist) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!currentPlaylist) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-10">
        <Link
          to="/playlists"
          className="btn btn-ghost text-gray-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to My Playlists
        </Link>

        <div className="text-center py-20">
          <BookOpen className="mx-auto w-16 h-16 text-gray-500 mb-4" />

          <h2 className="text-2xl font-bold text-white">
            Playlist not found
          </h2>

          <p className="text-gray-400 mt-2">
            This playlist could not be found.
          </p>
        </div>
      </div>
    );
  }

  const problems = currentPlaylist.problems || [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">

      {/* Back Button */}
      <Link
        to="/playlists"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to My Playlists
      </Link>

      {/* Playlist Header */}
      <div className="bg-base-200 border border-gray-700 rounded-2xl p-6 mb-8">

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              {currentPlaylist.name}
            </h1>

            <p className="text-gray-400 mt-2">
              {currentPlaylist.description || "No description"}
            </p>

            <p className="text-gray-300 mt-4">
              {problems.length}{" "}
              {problems.length === 1 ? "Problem" : "Problems"}
            </p>
          </div>
        </div>

      </div>

      {/* Problems */}
      {problems.length === 0 ? (
        <div className="bg-base-200 border border-gray-700 rounded-2xl text-center py-20 px-6">

          <BookOpen className="mx-auto w-16 h-16 text-gray-500 mb-4" />

          <h2 className="text-xl font-semibold text-white">
            No problems in this playlist
          </h2>

          <p className="text-gray-400 mt-2">
            Go to the Problems page and save some problems to this playlist.
          </p>

          <Link
            to="/"
            className="btn btn-primary mt-6"
          >
            Browse Problems
          </Link>

        </div>
      ) : (
        <div className="space-y-4">

          {problems.map((item) => {
            const problem = item.problem;

            if (!problem) return null;

            return (
              <div
                key={item.id}
                className="bg-base-200 border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition"
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  {/* Problem Information */}
                  <div className="flex-1">

                    <h2 className="text-xl font-bold text-white">
                      {problem.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 mt-3">

                      {/* Difficulty */}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          problem.difficulty === "EASY"
                            ? "bg-green-500/20 text-green-400"
                            : problem.difficulty === "MEDIUM"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>

                      {/* Tags */}
                      {problem.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-sm border border-gray-600 text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        navigate(`/problem/${problem.id}`)
                      }
                      className="btn btn-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Solve Problem
                    </button>

                    <button
                      onClick={() =>
                        handleRemoveProblem(problem.id)
                      }
                      className="btn btn-error btn-outline"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default PlaylistDetailsPage;