import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, FolderOpen } from "lucide-react";
import { usePlaylistStore } from "../store/usePlaylistStore";

const PlaylistPage = () => {
  const {
    playlists,
    getAllPlaylists,
    deletePlaylist,
    isLoading,
  } = usePlaylistStore();

  useEffect(() => {
    getAllPlaylists();
  }, []);

  const handleDelete = async (playlistId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this playlist?"
    );

    if (!confirmed) return;

    await deletePlaylist(playlistId);
  };

  if (isLoading && playlists.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          My Playlists
        </h1>

        <p className="text-gray-400 mt-2">
          Your saved coding problems
        </p>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="mx-auto w-16 h-16 text-gray-500 mb-4" />

          <h2 className="text-xl font-semibold text-white">
            No playlists yet
          </h2>

          <p className="text-gray-400 mt-2">
            Create a playlist and start saving problems.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {playlists.map((playlist) => (
            <div
              key={playlist.id}
            className="bg-base-200 border border-gray-700 rounded-xl p-5 shadow-lg"
            >

              <div className="flex justify-between items-start">

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {playlist.name}
                  </h2>

                  <p className="text-gray-400 mt-2 text-sm">
                    {playlist.description || "No description"}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="btn btn-error btn-sm"
                  title="Delete playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

              <p className="text-gray-300 mt-5">
                {playlist.problems?.length || 0} Problems
              </p>

              <Link
                to={`/playlists/${playlist.id}`}
                className="btn btn-primary w-full mt-5"
              >
                View Playlist
              </Link>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
