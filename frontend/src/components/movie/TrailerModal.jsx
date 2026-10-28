import Modal from "../common/Modal";

export default function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }) {
  if (!isOpen || !trailerUrl) return null;

  // Extract YouTube embed ID
  let embedUrl = trailerUrl;
  const match = trailerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${movieTitle} - Official Trailer`} maxWidth="max-w-3xl">
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={embedUrl}
          title={movieTitle}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Modal>
  );
}

