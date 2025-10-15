import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import CarouselMovieCard from "../Cards/CarouselMovieCard";

import {
    PickRandomResponse,
    PickRecommendationResponse,
} from "../../types/WatchlistTypes";
import { RecommendationResponse } from "../../types/RecommendationsTypes";

const responsive = {
    medium: {
        breakpoint: { max: 3000, min: 768 },
        items: 3,
        slidesToSlide: 3,
    },
};

interface CarouselRecDisplayProps {
    recommendations:
        | RecommendationResponse[]
        | PickRandomResponse[]
        | PickRecommendationResponse[];
}

const CarouselRecDisplay = ({ recommendations }: CarouselRecDisplayProps) => {
    return (
        <div className="relative h-fit w-[700px] mx-auto mt-4 flex flex-col align-middle rounded-lg shadow shadow-palette-darkbrown bg-palette-lightbrown">
            <Carousel
                swipeable={false}
                draggable={false}
                showDots={true}
                arrows={true}
                centerMode={true}
                responsive={responsive}
                ssr={true}
                infinite={true}
                autoPlay={false}
                rewindWithAnimation={true}
                customTransition="transform 1500ms ease-in-out"
                containerClass="carousel-container relative pt-4 pb-12 rounded-lg"
                dotListClass="absolute bottom-0 left-1/2 -translate-x-1/2 h-fit w-fit my-2 text-xs flex justify-center"
            >
                {recommendations.map((rec) => (
                    <CarouselMovieCard key={rec.url} recommendation={rec} />
                ))}
            </Carousel>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 rounded-l-lg bg-gradient-to-r from-palette-lightbrown to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 rounded-r-lg bg-gradient-to-l from-palette-lightbrown to-transparent" />
        </div>
    );
};

export default CarouselRecDisplay;
