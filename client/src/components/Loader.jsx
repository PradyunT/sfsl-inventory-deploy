import fruitBowlImage from '../assets/fruit_bowl.png';

const Loader = () => {
  return (
    <div className="h-[30rem] w-[20rem] border border-gray-300 rounded-xl flex flex-col justify-center items-center p-6 bg-[#FCFCF9]">

      {/* Heading */}
      <h1 className="mb-4 text-xl font-bold text-center text-gray-700">
        Preparing to share food and love
      </h1>

      {/* Image Stacking Container */}
      <div className="relative grid place-items-center w-auto mb-6">

        {/* Background Pulsating Image */}
        <img
          src={fruitBowlImage}
          alt="" // Alt text can be empty for decorative background image
          aria-hidden="true" // Hide from screen readers
          className="max-w-full h-auto max-h-48 col-start-1 row-start-1 opacity-50 animate-pulse-out-fade"
        />

        {/* Foreground Static Image */}
        <img
          src={fruitBowlImage}
          alt="fruit bowl" // Keep meaningful alt text here
          className="max-w-full h-auto max-h-48 col-start-1 row-start-1 z-10"
        />
      </div>

    </div>
  );
};

export default Loader;