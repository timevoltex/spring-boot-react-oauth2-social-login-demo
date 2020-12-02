import React, { useRef, Fragment, useState, useEffect } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import { getItem } from "./getItem";
import { API_BASE_URL, ACCESS_TOKEN } from "../constants";
import axios from "axios";
import LoadingIndicator from "./LoadingIndicator";

function GalleryContent({ category, isDone, setDone }) {
  const scaleUp = useRef(document.createElement("div"));
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const [navIndex, setNavIndex] = useState(0);
  let scaleSlider = [];
  let listSlider = [];
  const meta = [];
  const [detail, setDetail] = useState([]);

  const mobile = window.innerWidth;

  const getImage = async () => {
    if (!isDone) {
      getItem(category.format, category.subject)
        .then((response) => {
          const data = response;
          try {
            data.map(async (image, i) => {
              const detailResponse = await axios.get(
                API_BASE_URL + `/api/v1/artwork/${image.id}`,
                {
                  headers: {
                    Authorization: localStorage.getItem(ACCESS_TOKEN),
                  },
                }
              );
              meta.push(detailResponse.data);
              if (i === data.length - 1) {
                setDetail(meta);
                setDone(true);
              }
            });
          } catch (err) {
            console.log(err);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    adaptiveHeight: true,
    beforeChange: (_, next) => {
      setNavIndex(next);
    },
  };

  const listSettings = {
    slidesToScroll: 1,
    slidesToShow: 3,
    speed: 500,
    infinite: true,
    dots: false,
    centerPadding: "60px",
    centerMode: true,
    vertical: true,
    verticalSwiping: true,
    responsive: [
      {
        breakpoint: 400,
        settings: {
          vertical: false,
          verticalSwiping: false,
        },
      },
    ],
    beforeChange: (_, next) => {
      setNavIndex(next);
    },
  };
  function goTo(index) {
    setNavIndex(index);
    scaleSlider.slickGoTo(navIndex);
    listSlider.slickGoTo(navIndex);
  }
  useEffect(() => {
    setNav1(scaleSlider);
    setNav2(listSlider);
  }, [scaleSlider, listSlider]);

  useEffect(() => {
    getImage();
  }, [category]);

  if (!isDone) {
    return <LoadingIndicator />;
  } else {
    console.log(detail);
    return (
      <Fragment>
        <ContentContainer className="photo_contents" ref={scaleUp}>
          <Slider
            asNavFor={nav1}
            ref={(slider2) => (listSlider = slider2)}
            {...listSettings}
            className="list"
          >
            {detail.map((src, i) => {
              return (
                <div key={src.filePath + src.id}>
                  <Image
                    style={{
                      backgroundImage: `url("${src.filepath}")`,
                    }}
                    onClick={() => goTo(i)}
                  >
                    {/* <img style={{width:}} src={src.filePath} alt="content" onClick={onClick} /> */}
                  </Image>
                </div>
              );
            })}
          </Slider>
          <Slider
            asNavFor={nav2}
            ref={(slider1) => (scaleSlider = slider1)}
            {...settings}
            className="scale"
          >
            {detail.map((image, i) => {
              console.log(i);
              return (
                <div key={i}>
                  <SliderContainer className="test">
                    <img src={image.filepath || ""} alt="content" />
                    <ContentDescription>
                      <p>상세정보</p>
                      <p>제목: {image.title}</p>
                      <p>설명: {image.content}</p>
                      <p>작가: {image.artist}</p>
                    </ContentDescription>
                  </SliderContainer>
                </div>
              );
            })}
          </Slider>
        </ContentContainer>
      </Fragment>
    );
  }
}

export default GalleryContent;

// display: flex;
// flex-wrap: wrap;
// align-items: flex-start;
const ContentContainer = styled.div`
  display: flex;
  .slick-slider.scale {
    width: 70vmax;
  }
  .slick-slider.list {
    position: absolute;
    width: 10vw;
    right: 0;
    :hover {
      width: 20vw;
    }
  }
  .scale .slick-track {
    display: flex;
  }
  .slick-track .slick-slide {
    display: flex;
    height: auto;
    align-items: center;
    justify-content: center;
  }
  .scale .slick-slide {
    height: 80vh;
  }
  .slick-next {
    right: 0;
  }
  .slick-prev {
    left: 0;
  }
  @media only screen and (max-width: 390px) {
    width: 100%;
    display: block;
    .slick-slider.scale {
      width: 100vw;
    }
    .slick-slider.list {
      position: absolute;
      width: 90vw;
      margin: auto;
    }
  }
`;

const Image = styled.div`
  width: 16vw;
  height: 16vw;
  background-size: cover;
  background-position: center;
`;

const SliderContainer = styled.div`
  display: flex;
  width: max-content;
  margin: 8vmin auto;

  img {
    width: 50vmin;
  }
  @media (max-width: 390px) {
    display: block;
    img {
      width: 80vmin;
    }
  }
`;

const ContentDescription = styled.div`
  width: 50vmin;
  background-color: white;
  @media (max-width: 390px) {
    width: 80vmin;
  }
`;
