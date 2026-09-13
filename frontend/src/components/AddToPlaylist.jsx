import React, { useEffect, useState } from "react";
import { X, Plus, Loader, Check } from "lucide-react";
import { usePlaylistStore } from "../store/usePlaylistStore";

const AddToPlaylistModal = ({ isOpen, onClose, problemId }) => {
  const {
    playlists,
    getAllPlaylists,
    addProblemToPlaylist,
    isLoading,
  } = usePlaylistStore();

  const [selectedPlaylist, setSelectedPlaylist] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedPlaylist("");
      getAllPlaylists();
    }
  }, [isOpen, getAllPlaylists]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlaylist) return;

    // Check whether problem is already in selected playlist
    const selectedPlaylistData = playlists.find(
      (playlist) => playlist.id === selectedPlaylist
    );

    const alreadyAdded =
      selectedPlaylistData?.problems?.some(
        (item) => item.problemId === problemId
      );

    if (alreadyAdded) {
      return;
    }

    const success = await addProblemToPlaylist(
      selectedPlaylist,
      [problemId]
    );

    if (success) {
      // Refresh playlists so the modal has the latest data
      await getAllPlaylists();

      // Keep modal open so user can see "Already added"
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="surface page-enter rounded-xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/10">
          <h3 className="text-xl font-bold">
            Add to Playlist
          </h3>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">

          <label className="block mb-3 font-medium">
            Select Playlist
          </label>

          {/* Loading */}
          {isLoading && playlists.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 animate-spin" />
            </div>
          )}

          {/* No playlists */}
          {!isLoading && playlists.length === 0 && (
            <div className="border border-white/10 rounded-lg p-5 text-center">
              <p className="text-sm opacity-70">
                You don't have any playlists yet.
              </p>
            </div>
          )}

          {/* Playlist list */}
          {playlists.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">

              {playlists.map((playlist) => {

                const alreadyAdded =
                  playlist.problems?.some(
                    (item) => item.problemId === problemId
                  );

                const isSelected =
                  selectedPlaylist === playlist.id;

                return (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => {
                      if (!alreadyAdded) {
                        setSelectedPlaylist(playlist.id);
                      }
                    }}
                    disabled={isLoading || alreadyAdded}
                    className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-lg border transition ${alreadyAdded
                        ? "border-green-500/40 bg-green-500/10 cursor-default"
                        : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-white/10 hover:border-primary/50"
                      }`}
                  >

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {playlist.name}
                      </p>

                      {playlist.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {playlist.description}
                        </p>
                      )}

                      {alreadyAdded && (
                        <p className="text-xs text-green-400 mt-1">
                          Problem already added
                        </p>
                      )}
                    </div>
                    {/* Status */}
                    {alreadyAdded ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check className="w-5 h-5" />
                        <span className="text-xs">
                          Added
                        </span>
                      </div>
                    ) : (
                      isSelected && (
                        <Check className="w-5 h-5 text-primary shrink-0" />
                      )
                    )}

                  </button>
                );
              })}

            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6">

            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                !selectedPlaylist ||
                isLoading ||
                playlists
                  .find((p) => p.id === selectedPlaylist)
                  ?.problems?.some(
                    (item) => item.problemId === problemId
                  )
              }
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}

              Add to Playlist
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;