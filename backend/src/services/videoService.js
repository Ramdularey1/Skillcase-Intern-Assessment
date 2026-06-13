import { pool, query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export async function createVideo({ title, description, category, file_path }) {
  const { rows } = await query(
    `insert into videos (title, description, category, file_path)
     values ($1, $2, $3, $4)
     returning *`,
    [title, description, category, file_path]
  );
  return rows[0];
}

export async function getVideos(userId) {
  const { rows } = await query(
    `select
       v.*,
       exists(select 1 from likes l where l.video_id = v.id and l.user_id = $1) as liked_by_me,
       exists(select 1 from bookmarks b where b.video_id = v.id and b.user_id = $1) as bookmarked_by_me
     from videos v
     order by v.created_at desc`,
    [userId || null]
  );
  return rows;
}

export async function getVideoById(id, userId) {
  const { rows } = await query(
    `select
       v.*,
       exists(select 1 from likes l where l.video_id = v.id and l.user_id = $2) as liked_by_me,
       exists(select 1 from bookmarks b where b.video_id = v.id and b.user_id = $2) as bookmarked_by_me
     from videos v
     where v.id = $1`,
    [id, userId || null]
  );

  if (!rows[0]) {
    throw new AppError("Video not found", 404);
  }

  return rows[0];
}

export async function likeVideo(videoId, userId) {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const videoExists = await client.query("select id from videos where id = $1 for update", [
      videoId
    ]);

    if (!videoExists.rows[0]) {
      throw new AppError("Video not found", 404);
    }

    const insert = await client.query(
      `insert into likes (user_id, video_id)
       values ($1, $2)
       on conflict do nothing
       returning user_id`,
      [userId, videoId]
    );

    if (insert.rowCount === 1) {
      await client.query(
        "update videos set like_count = like_count + 1 where id = $1",
        [videoId]
      );
    }

    const { rows } = await client.query("select * from videos where id = $1", [videoId]);

    await client.query("commit");
    return { video: rows[0], liked: true, alreadyLiked: insert.rowCount === 0 };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function bookmarkVideo(videoId, userId) {
  const video = await query("select id from videos where id = $1", [videoId]);

  if (!video.rows[0]) {
    throw new AppError("Video not found", 404);
  }

  const { rowCount } = await query(
    `insert into bookmarks (user_id, video_id)
     values ($1, $2)
     on conflict do nothing`,
    [userId, videoId]
  );

  return { bookmarked: true, alreadyBookmarked: rowCount === 0 };
}

export async function createComment(videoId, userId, content) {
  const video = await query("select id from videos where id = $1", [videoId]);

  if (!video.rows[0]) {
    throw new AppError("Video not found", 404);
  }

  const { rows } = await query(
    `insert into comments (user_id, video_id, content)
     values ($1, $2, $3)
     returning *`,
    [userId, videoId, content]
  );
  return rows[0];
}

export async function getComments(videoId) {
  const { rows } = await query(
    `select c.id, c.content, c.created_at, u.id as user_id, u.name as user_name
     from comments c
     join app_users u on u.id = c.user_id
     where c.video_id = $1
     order by c.created_at desc`,
    [videoId]
  );
  return rows;
}
