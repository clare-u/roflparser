const Loading: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-warmGray400 border-t-transparent"></div>
    </div>
  );
};

export default Loading;
