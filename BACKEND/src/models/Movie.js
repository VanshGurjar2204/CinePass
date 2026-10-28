import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    genre: {
      type: [String],
      required: [true, "At least one genre is required"],
      index: true,
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
      index: true,
    },
    duration: {
      type: Number, // duration in minutes
      required: [true, "Duration is required"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    poster: {
      type: String,
      required: [true, "Poster URL is required"],
    },
    backdrop: {
      type: String,
      default: "",
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    certificate: {
      type: String,
      default: "U/A", // e.g. U, U/A, A, PG-13, R
    },
    status: {
      type: String,
      enum: ["now_showing", "upcoming", "ended"],
      default: "now_showing",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search across title, description, cast, director, genre
movieSchema.index({
  title: "text",
  description: "text",
  cast: "text",
  director: "text",
  genre: "text",
});

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;

