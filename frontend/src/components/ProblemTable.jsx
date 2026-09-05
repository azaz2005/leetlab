import React, { useState, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import {
  Bookmark,
  PencilIcon,
  TrashIcon,
  Plus,
} from "lucide-react";
import { useActions } from "../store/useAction";
import AddToPlaylistModal from "./AddToPlaylist";
import CreatePlaylistModal from "./CreatePlaylistModal";
import { usePlaylistStore } from "../store/usePlaylistStore";

const ProblemsTable = ({ problems }) => {
  const { authUser } = useAuthStore();
  const { onDeleteProblem } = useActions();
  const { createPlaylist } = usePlaylistStore();

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] =
    useState(false);

  const [selectedProblemId, setSelectedProblemId] = useState(null);

  // Extract all unique tags from problems
  const allTags = useMemo(() => {
    if (!Array.isArray(problems)) return [];

    const tagsSet = new Set();

    problems.forEach((problem) => {
      (problem.tags || []).forEach((tag) => {
        tagsSet.add(tag);
      });
    });

    return Array.from(tagsSet);
  }, [problems]);

  // Allowed difficulties
  const difficulties = ["EASY", "MEDIUM", "HARD"];

  // Filter problems
  const filteredProblems = useMemo(() => {
    return (problems || [])
      .filter((problem) =>
        (problem.title || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .filter((problem) =>
        difficulty === "ALL"
          ? true
          : problem.difficulty === difficulty
      )
      .filter((problem) =>
        selectedTag === "ALL"
          ? true
          : (problem.tags || []).includes(selectedTag)
      );
  }, [problems, search, difficulty, selectedTag]);

  // Pagination
  const itemsPerPage = 5;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProblems.length / itemsPerPage)
  );

  const paginatedProblems = useMemo(() => {
    return filteredProblems.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProblems, currentPage]);

  // Reset page when filters/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, difficulty, selectedTag]);

  const handleDelete = (id) => {
    onDeleteProblem(id);
  };

  const handleCreatePlaylist = async (data) => {
    await createPlaylist(data);
    setIsCreateModalOpen(false);
  };

  const handleAddToPlaylist = (problemId) => {
    setSelectedProblemId(problemId);
    setIsAddToPlaylistModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Problems
        </h2>

        <button
          className="btn btn-primary gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search by title"
          className="input input-bordered w-full md:w-1/3 bg-base-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Difficulty */}
        <select
          className="select select-bordered bg-base-200"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="ALL">
            All Difficulties
          </option>

          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() +
                diff.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        {/* Tags */}
        <select
          className="select select-bordered bg-base-200"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="ALL">
            All Tags
          </option>

          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Problems Table */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="table table-zebra table-lg bg-base-200 text-base-content">

          <thead className="bg-base-300">
            <tr>
              <th>Solved</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedProblems.length > 0 ? (
              paginatedProblems.map((problem) => {

                /*
                 * FIX:
                 * problem.solvedBy can be undefined.
                 * Using (problem.solvedBy || []) guarantees
                 * that .some() always works.
                 */
               const isSolved = problem.solved === true;

                return (
                  <tr key={problem.id}>

                    {/* Solved */}
                    <td>
                      <input
                        type="checkbox"
                        checked={isSolved}
                        readOnly
                        className="checkbox checkbox-sm"
                      />
                    </td>

                    {/* Title */}
                    <td>
                      <Link
                        to={`/problem/${problem.id}`}
                        className="font-semibold hover:underline"
                      >
                        {problem.title}
                      </Link>
                    </td>

                    {/* Tags */}
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(problem.tags || []).map((tag, index) => (
                          <span
                            key={index}
                            className="badge badge-outline badge-warning text-xs font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td>
                      <span
                        className={`badge font-semibold text-xs text-white ${
                          problem.difficulty === "EASY"
                            ? "badge-success"
                            : problem.difficulty === "MEDIUM"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">

                        {/* Admin actions */}
                        {authUser?.role === "ADMIN" && (
                          <div className="flex gap-2">

                            {/* Delete */}
                            <button
                              onClick={() =>
                                handleDelete(problem.id)
                              }
                              className="btn btn-sm btn-error"
                            >
                              <TrashIcon className="w-4 h-4 text-white" />
                            </button>

                            {/* Edit - currently disabled */}
                            <button
                              disabled
                              className="btn btn-sm btn-warning"
                            >
                              <PencilIcon className="w-4 h-4 text-white" />
                            </button>

                          </div>
                        )}

                        {/* Save to Playlist */}
                        <button
                          className="btn btn-sm btn-outline flex gap-2 items-center"
                          onClick={() =>
                            handleAddToPlaylist(problem.id)
                          }
                        >
                          <Bookmark className="w-4 h-4" />

                          <span className="hidden sm:inline">
                            Save to Playlist
                          </span>
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  No problems found.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">

        <button
          className="btn btn-sm"
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => prev - 1)
          }
        >
          Prev
        </button>

        <span className="btn btn-ghost btn-sm">
          {currentPage} / {totalPages}
        </span>

        <button
          className="btn btn-sm"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => prev + 1)
          }
        >
          Next
        </button>

      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePlaylist}
      />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setIsAddToPlaylistModalOpen(false)}
        problemId={selectedProblemId}
      />

    </div>
  );
};

export default ProblemsTable;