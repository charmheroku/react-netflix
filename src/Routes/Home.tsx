import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  IGetMovieResult,
} from "../api";
import { makeImagePath } from "../utils";
import MovieDetail from "./MovieDetail";

const Wrapper = styled.div`
  background: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  width: 50%;
  font-size: 30px;
`;

const Slider = styled.div`
  position: relative;
  margin: 50px 0px 70px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: -100px;
`;

const SliderTitle = styled.h2`
  width: 200px;
  height: 50px;
  position: absolute;
  background-color: transparent;
  top: -50px;
  left: 40px;
  text-transform: uppercase;
  font-weight: 500;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const Button = styled.div`
  width: 2%;
  height: 200px;
  background-color: transparent;
  z-index: 99;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
`;

const Row = styled(motion.div)`
  display: grid;
  padding: 0 2%;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 64px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled(motion.div)`
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center center;
`;

const BigTitle = styled(motion.h3)`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 32px;
  position: relative;
  top: -80px;
`;

const rowVariants = {
  hidden: (isBack: boolean) => ({
    x: isBack ? -window.innerWidth : window.innerWidth,
  }),
  visible: {
    x: 0,
  },
  exit: (isBack: boolean) => ({
    x: isBack ? window.innerWidth : -window.innerWidth,
  }),
};

const BoxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.3,
      duration: 0.1,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.3,
      duration: 0.1,
      type: "tween",
    },
  },
};

const offset = 6;

const categories = {
  nowPlaying: "nowPlaying",
  latest: "latest",
  topRated: "topRated",
  upcoming: "upcoming",
};

function Home() {
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");
  const { scrollY } = useViewportScroll();
  const { data: nowPlayingMovies, isLoading: nowPlayingMoviesLoading } =
    useQuery<IGetMovieResult>(
      ["movies", categories.nowPlaying],
      getNowPlayingMovies
    );
  const { data: latestMovies, isLoading: latestMoviesLoading } =
    useQuery<IGetMovieResult>(["movies", categories.latest], getPopularMovies);
  const { data: topRatedMovies, isLoading: topRatedMoviesLoading } =
    useQuery<IGetMovieResult>(
      ["movies", categories.topRated],
      getTopRatedMovies
    );
  const { data: upcomingMovies, isLoading: upcomingMoviesLoading } =
    useQuery<IGetMovieResult>(
      ["movies", categories.upcoming],
      getUpcomingMovies
    );
  const [clickedRowMovies, setClickedRowMovies] = useState<IGetMovieResult>();
  const [clickedRowName, setClickedRowName] = useState<string>();
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const [nowPlayingIndex, setNowPlayingIndex] = useState(0);
  const [latestIndex, setLatestIndex] = useState(0);
  const [topRatedIndex, setTopRatedIndex] = useState(0);
  const [upcomingIndex, setUpcomingIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [isBack, setIsBack] = useState(false);
  const decreaseIndex = (category: string, data: any) => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      setIsBack(true);
      let totalMovies = data.results.length;
      let maxIndex = Math.ceil(totalMovies / offset) - 1; 
      if (category === categories.nowPlaying) {
        totalMovies = totalMovies - 1; 
        setNowPlayingIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (category === categories.latest) {
        setLatestIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (category === categories.topRated) {
        setTopRatedIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (category === categories.upcoming) {
        setUpcomingIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      }
    }
  };
  const increaseIndex = (category: string, data: any) => {
    if (data) {
      if (leaving) return;
      setIsBack(false);
      toggleLeaving();
      let totalMovies = data.results.length;
      let maxIndex = Math.ceil(totalMovies / offset) - 1; 
      if (category === categories.nowPlaying) {
        totalMovies = totalMovies - 1; 
        setNowPlayingIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (category === categories.latest) {
        setLatestIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (category === categories.topRated) {
        setTopRatedIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (category === categories.upcoming) {
        setUpcomingIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };
  const onOverlayClick = () => history.goBack();
  const onBoxClicked = (category: string, movieId: number) => {
    history.push(`/movies/${movieId}`);
    setClickedRowName(category);
    if (category === categories.nowPlaying) {
      setClickedRowMovies(nowPlayingMovies);
    } else if (category === categories.latest) {
      setClickedRowMovies(latestMovies);
    } else if (category === categories.topRated) {
      setClickedRowMovies(topRatedMovies);
    } else if (category === categories.upcoming) {
      setClickedRowMovies(upcomingMovies);
    }
  };
  let clickedMovie =
    bigMovieMatch?.params.movieId &&
    clickedRowMovies?.results.find(
      (movie) => movie.id === +bigMovieMatch.params.movieId
    );
  return (
    <Wrapper>
      {nowPlayingMoviesLoading ||
      latestMoviesLoading ||
      topRatedMoviesLoading ||
      upcomingMoviesLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(
              nowPlayingMovies?.results[0].backdrop_path || ""
            )}
          >
            <Title>{nowPlayingMovies?.results[0].title}</Title>
            <Overview>{nowPlayingMovies?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <SliderTitle>Now Playing Movies</SliderTitle>
            <Button
              onClick={() =>
                decreaseIndex(categories.nowPlaying, nowPlayingMovies)
              }
            >
              <span>{`<`}</span>
            </Button>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={isBack}
            >
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                custom={isBack}
                key={nowPlayingIndex}
              >
                {nowPlayingMovies?.results
                  .slice(1) 
                  .slice(
                    offset * nowPlayingIndex,
                    offset * nowPlayingIndex + offset
                  ) 
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + categories.nowPlaying}
                      key={movie.id + categories.nowPlaying}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      onClick={() =>
                        onBoxClicked(categories.nowPlaying, movie.id)
                      }
                      variants={BoxVariants}
                      initial="normal"
                      transition={{ type: "tween" }}
                      whileHover="hover"
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <Button
              onClick={() =>
                increaseIndex(categories.nowPlaying, nowPlayingMovies)
              }
            >
              <span>{`>`}</span>
            </Button>
          </Slider>
          <Slider>
            <SliderTitle>Latest Movies</SliderTitle>
            <Button
              onClick={() => decreaseIndex(categories.latest, latestMovies)}
            >
              <span>{`<`}</span>
            </Button>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={isBack}
            >
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                custom={isBack}
                key={latestIndex}
              >
                {latestMovies?.results
                  .slice(1) 
                  .slice(offset * latestIndex, offset * latestIndex + offset) 
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + categories.latest}
                      key={movie.id + categories.latest}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      onClick={() => onBoxClicked(categories.latest, movie.id)}
                      variants={BoxVariants}
                      initial="normal"
                      transition={{ type: "tween" }}
                      whileHover="hover"
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <Button
              onClick={() => increaseIndex(categories.latest, latestMovies)}
            >
              <span>{`>`}</span>
            </Button>
          </Slider>
          <Slider>
            <SliderTitle>Top Rated Movies</SliderTitle>
            <Button
              onClick={() => decreaseIndex(categories.topRated, topRatedMovies)}
            >
              <span>{`<`}</span>
            </Button>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={isBack}
            >
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                custom={isBack}
                key={topRatedIndex}
              >
                {topRatedMovies?.results
                  .slice(1) 
                  .slice(
                    offset * topRatedIndex,
                    offset * topRatedIndex + offset
                  )
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + categories.topRated}
                      key={movie.id + categories.topRated}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      onClick={() =>
                        onBoxClicked(categories.topRated, movie.id)
                      }
                      variants={BoxVariants}
                      initial="normal"
                      transition={{ type: "tween" }}
                      whileHover="hover"
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <Button
              onClick={() => increaseIndex(categories.topRated, topRatedMovies)}
            >
              <span>{`>`}</span>
            </Button>
          </Slider>
          <Slider>
            <SliderTitle>Upcoming Movies</SliderTitle>
            <Button
              onClick={() => decreaseIndex(categories.upcoming, upcomingMovies)}
            >
              <span>{`<`}</span>
            </Button>
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={isBack}
            >
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                custom={isBack}
                key={upcomingIndex}
              >
                {upcomingMovies?.results
                  .slice(1) 
                  .slice(
                    offset * upcomingIndex,
                    offset * upcomingIndex + offset
                  ) 
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + categories.upcoming}
                      key={movie.id + categories.upcoming}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      onClick={() =>
                        onBoxClicked(categories.upcoming, movie.id)
                      }
                      variants={BoxVariants}
                      initial="normal"
                      transition={{ type: "tween" }}
                      whileHover="hover"
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <Button
              onClick={() => increaseIndex(categories.upcoming, upcomingMovies)}
            >
              <span>{`>`}</span>
            </Button>
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                ></Overlay>
                <BigMovie
                  layoutId={bigMovieMatch.params.movieId + clickedRowName}
                  style={{
                    top: scrollY.get() + 100,
                  }}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <MovieDetail />
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
