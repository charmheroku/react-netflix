import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import {
  getAiringTodayTvs,
  getOnTheAirTvs,
  getPopularTvs,
  getTopRatedTvs,
  IGetTvResult,
} from "../api";
import { makeImagePath } from "../utils";
import TvDetail from "./TvDetail";

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

const Bigtv = styled(motion.div)`
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
  airingToday: "airingToday",
  onTheAir: "onTheAir",
  popular: "popular",
  topRated: "topRated",
};

function Tv() {
  const history = useHistory();
  const bigTvMatch = useRouteMatch<{ tvId: string }>("/tvs/:tvId");
  const { scrollY } = useViewportScroll();
  const { data: airingTodayTvs, isLoading: airingTodayTvsLoading } =
    useQuery<IGetTvResult>(["tvs", categories.airingToday], getAiringTodayTvs);
  const { data: onTheAirTvs, isLoading: onTheAirTvsLoading } =
    useQuery<IGetTvResult>(["tvs", categories.onTheAir], getOnTheAirTvs);
  const { data: popularTvs, isLoading: popularTvsLoading } =
    useQuery<IGetTvResult>(["tvs", categories.popular], getPopularTvs);
  const { data: topRatedTvs, isLoading: topRatedTvsLoading } =
    useQuery<IGetTvResult>(["tvs", categories.topRated], getTopRatedTvs);
  const [clickedRowTvs, setClickedRowTvs] = useState<IGetTvResult>();
  const [clickedRowName, setClickedRowName] = useState<string>();
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const [airingTodayIndex, setAiringTodayIndex] = useState(0);
  const [onTheAirIndex, setOnTheAirIndex] = useState(0);
  const [popularIndex, setPopularIndex] = useState(0);
  const [topRatedIndex, settopRatedIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [isBack, setIsBack] = useState(false);
  const decreaseIndex = (category: string, data: any) => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      setIsBack(true);
      let totalTvs = data.results.length;
      let maxIndex = Math.ceil(totalTvs / offset) - 1; 
      if (category === categories.airingToday) {
        totalTvs = totalTvs - 1; 
        setAiringTodayIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (category === categories.onTheAir) {
        setOnTheAirIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (category === categories.popular) {
        setPopularIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (category === categories.topRated) {
        settopRatedIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      }
    }
  };
  const increaseIndex = (category: string, data: any) => {
    if (data) {
      if (leaving) return;
      setIsBack(false);
      toggleLeaving();
      let totalTvs = data.results.length;
      let maxIndex = Math.ceil(totalTvs / offset) - 1;
      if (category === categories.airingToday) {
        totalTvs = totalTvs - 1; 
        setAiringTodayIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (category === categories.onTheAir) {
        setOnTheAirIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (category === categories.popular) {
        setPopularIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (category === categories.topRated) {
        settopRatedIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };
  const onOverlayClick = () => history.goBack();
  const onBoxClicked = (category: string, tvId: number) => {
    history.push(`/Tvs/${tvId}`);
    setClickedRowName(category);
    if (category === categories.airingToday) {
      setClickedRowTvs(airingTodayTvs);
    } else if (category === categories.onTheAir) {
      setClickedRowTvs(onTheAirTvs);
    } else if (category === categories.popular) {
      setClickedRowTvs(popularTvs);
    } else if (category === categories.topRated) {
      setClickedRowTvs(topRatedTvs);
    }
  };
  let clickedTv =
    bigTvMatch?.params.tvId &&
    clickedRowTvs?.results.find((tv) => tv.id === +bigTvMatch.params.tvId);
  return (
    <Wrapper>
      {airingTodayTvsLoading ||
      onTheAirTvsLoading ||
      popularTvsLoading ||
      topRatedTvsLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(
              airingTodayTvs?.results[0].backdrop_path || ""
            )}
          >
            <Title>{airingTodayTvs?.results[0].name}</Title>
            <Overview>{airingTodayTvs?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <SliderTitle>Now Playing TV shows</SliderTitle>
            <Button
              onClick={() =>
                decreaseIndex(categories.airingToday, airingTodayTvs)
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
                key={airingTodayIndex}
              >
                {airingTodayTvs?.results
                  .slice(1) 
                  .slice(
                    offset * airingTodayIndex,
                    offset * airingTodayIndex + offset
                  ) 
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + categories.airingToday}
                      key={tv.id + categories.airingToday}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      onClick={() =>
                        onBoxClicked(categories.airingToday, tv.id)
                      }
                      variants={BoxVariants}
                      initial="normal"
                      transition={{ type: "tween" }}
                      whileHover="hover"
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <Button
              onClick={() =>
                increaseIndex(categories.airingToday, airingTodayTvs)
              }
            >
              <span>{`>`}</span>
            </Button>
          </Slider>
          <Slider>
            <SliderTitle>On The Air Tv Shows</SliderTitle>
            <Button
              onClick={() => decreaseIndex(categories.onTheAir, onTheAirTvs)}
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
                key={onTheAirIndex}
              >
                {onTheAirTvs?.results
                  .slice(1) 
                  .slice(
                    offset * onTheAirIndex,
                    offset * onTheAirIndex + offset
                  )
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + categories.onTheAir}
                      key={tv.id + categories.onTheAir}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      onClick={() => onBoxClicked(categories.onTheAir, tv.id)}
                      variants={BoxVariants}
                      initial="normal"
                      transition={{ type: "tween" }}
                      whileHover="hover"
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <Button
              onClick={() => increaseIndex(categories.onTheAir, onTheAirTvs)}
            >
              <span>{`>`}</span>
            </Button>
          </Slider>
          <Slider>
            <SliderTitle>Popular TV Shows</SliderTitle>
            <Button
              onClick={() => decreaseIndex(categories.popular, popularTvs)}
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
                key={popularIndex}
              >
                {popularTvs?.results
                  .slice(1) 
                  .slice(offset * popularIndex, offset * popularIndex + offset) 
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + categories.popular}
                      key={tv.id + categories.popular}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      onClick={() => onBoxClicked(categories.popular, tv.id)}
                      variants={BoxVariants}
                      initial="normal"
                      transition={{ type: "tween" }}
                      whileHover="hover"
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <Button
              onClick={() => increaseIndex(categories.popular, popularTvs)}
            >
              <span>{`>`}</span>
            </Button>
          </Slider>
          <Slider>
            <SliderTitle>Top Rated TV Shows</SliderTitle>
            <Button
              onClick={() => decreaseIndex(categories.topRated, topRatedTvs)}
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
                {topRatedTvs?.results
                  .slice(1) 
                  .slice(
                    offset * topRatedIndex,
                    offset * topRatedIndex + offset
                  ) 
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + categories.topRated}
                      key={tv.id + categories.topRated}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                      onClick={() => onBoxClicked(categories.topRated, tv.id)}
                      variants={BoxVariants}
                      initial="normal"
                      transition={{ type: "tween" }}
                      whileHover="hover"
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <Button
              onClick={() => increaseIndex(categories.topRated, topRatedTvs)}
            >
              <span>{`>`}</span>
            </Button>
          </Slider>
          <AnimatePresence>
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                ></Overlay>
                <Bigtv
                  layoutId={bigTvMatch.params.tvId + clickedRowName}
                  style={{
                    top: scrollY.get() + 100,
                  }}
                >
                  {clickedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedTv.backdrop_path
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedTv.name}</BigTitle>
                      <TvDetail />
                    </>
                  )}
                </Bigtv>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Tv;
