import { useQuery } from "react-query";
import { useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { getTvDetail, IGetTvDetail } from "../api";

const Info = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  top: -100px;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  font-size: 14px;
`;

const Tag = styled.div`
  width: 100%;
  font-size: 28px;
  font-weight: 600;
  font-style: italic;
  text-align: center;
  margin-bottom: 10px;
`;

const Meta = styled.div`
  width: 100%;
  margin: 10px 0px;
  div {
    margin: 5px 0px;
  }
`;

const Overview = styled.div`
  margin: 10px 0px;
  font-size: 18px;
`;

const Div = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 600;
  font-style: italic;
  h2 {
    font-style: normal;
    font-weight: 400;
    margin-right: 5px;
  }
`;

const Genres = styled.ul`
  width: 100%;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  bottom: 10px;
`;

function TvDetail() {
  const tvMatch = useRouteMatch<{ tvId: string }>(`/tvs/:tvId`);
  const { data: info, isLoading } = useQuery<IGetTvDetail>("TvDetail", () =>
    getTvDetail(tvMatch?.params.tvId)
  );
  console.log("info", info);
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Info>
          <Tag>{info?.tagline ? `“${info?.tagline}”` : null}</Tag>
          <Overview>{info?.overview}</Overview>
          <Meta>
            <Div>
              <h2>Status : </h2>
              {info?.status}
            </Div>
            <Div>
              <h2>Number of Seasons : </h2>
              {info?.number_of_seasons}
            </Div>
            <Div>
              <h2>Number of Episodes : </h2>
              {info?.number_of_episodes}
            </Div>
            <Div>
              <h2>Vote Average : </h2>
              {info?.vote_average} / 10
            </Div>
          </Meta>
          <Genres>
            {info?.genres.map((genre) => (
              <li>{genre.name}</li>
            ))}
          </Genres>
        </Info>
      )}
    </div>
  );
}

export default TvDetail;
