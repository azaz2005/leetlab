import { db } from "../libs/db.js";

export const createPlayList = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const playList = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Playlist created successfully",
      playList,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
};

export const getPlayAllListDetails = async (req, res) => {
  try {
    const playLists = await db.playlist.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playLists,
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
};
export const getPlayListDetails = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playList = await db.playlist.findUnique({
      where: { id: playlistId, userId: req.user.id },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playList) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playList,
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    // Validate problemIds
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        error: "Invalid or missing problemIds",
      });
    }

    // Make sure playlist belongs to logged-in user
    const playlist = await db.playlist.findFirst({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
    });

    if (!playlist) {
      return res.status(404).json({
        error: "Playlist not found",
      });
    }

    // Make sure all problems actually exist
    const problems = await db.problem.findMany({
      where: {
        id: {
          in: problemIds,
        },
      },
      select: {
        id: true,
      },
    });

    const existingProblemIds = new Set(
      problems.map((problem) => problem.id)
    );

    const invalidProblemIds = problemIds.filter(
      (problemId) => !existingProblemIds.has(problemId)
    );

    if (invalidProblemIds.length > 0) {
      return res.status(404).json({
        error: "One or more problems were not found",
      });
    }

    // Remove duplicate IDs from request
    const uniqueProblemIds = [...new Set(problemIds)];

    // Add problems to playlist
    const problemsInPlaylist =
      await db.problemInPlaylist.createMany({
        data: uniqueProblemIds.map((problemId) => ({
          playListId: playlistId,
          problemId,
        })),

        // Prevent 500 when problem is already in playlist
        skipDuplicates: true,
      });

    return res.status(201).json({
      success: true,
      message: "Problems added to playlist successfully",
      problemsInPlaylist,
    });
  } catch (error) {
    console.error(
      "Error adding problems to playlist:",
      error
    );

    return res.status(500).json({
      error: "Failed to add problems to playlist",
      details: error.message,
    });
  }
};
export const deletePlayList = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.error("Error deleting playlist:", error.message);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemIds" });
    }
    // Only delete given problemIds not all

    const deletedProblem = await db.problemInPlaylist.deleteMany({
      where: {
        playListId: playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem removed from playlist successfully",
      deletedProblem,
    });
  } catch (error) {
    console.error("Error removing problem from playlist:", error.message);
    res.status(500).json({ error: "Failed to remove problem from playlist" });
  }
};