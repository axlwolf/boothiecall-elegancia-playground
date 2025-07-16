import { FrameWindow } from '../types';

interface FrameMappingData {
  frame: string;
  frameWidth: number;
  frameHeight: number;
  windows: FrameWindow[];
}

const frameMappings: { [key: string]: FrameMappingData } = {
  // 1-shot designs
  '1shot-design1': {
    frame: '/designs/1shot-design1.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 50, top: 50, width: 300, height: 450, borderRadius: 10 },
    ],
  },
  '1shot-design2': {
    frame: '/designs/1shot-design2.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 40, top: 60, width: 320, height: 440, borderRadius: 15 },
    ],
  },
  '1shot-design3': {
    frame: '/designs/1shot-design3.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 60, top: 40, width: 280, height: 460, borderRadius: 8 },
    ],
  },
  '1shot-design4': {
    frame: '/designs/1shot-design4.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 45, top: 55, width: 310, height: 450, borderRadius: 12 },
    ],
  },
  '1shot-design5': {
    frame: '/designs/1shot-design5.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 55, top: 45, width: 290, height: 470, borderRadius: 6 },
    ],
  },
  '1shot-design6': {
    frame: '/designs/1shot-design6.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 50, top: 50, width: 300, height: 450, borderRadius: 20 },
    ],
  },
  '1shot-design7': {
    frame: '/designs/1shot-design7.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 35, top: 65, width: 330, height: 430, borderRadius: 5 },
    ],
  },
  '1shot-design8': {
    frame: '/designs/1shot-design8.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 65, top: 35, width: 270, height: 480, borderRadius: 18 },
    ],
  },
  '1shot-design9': {
    frame: '/designs/1shot-design9.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 50, top: 50, width: 300, height: 450, borderRadius: 25 },
    ],
  },
  '1shot-design10': {
    frame: '/designs/1shot-design10.png',
    frameWidth: 400,
    frameHeight: 600,
    windows: [
      { left: 40, top: 40, width: 320, height: 470, borderRadius: 3 },
    ],
  },

  // 3-shot designs
  '3shot-design1': {
    frame: '/designs/3shot-design1.png',
    frameWidth: 400,
    frameHeight: 650,
    windows: [
      { left: 50, top: 50, width: 300, height: 150, borderRadius: 5 },
      { left: 50, top: 250, width: 300, height: 150, borderRadius: 5 },
      { left: 50, top: 450, width: 300, height: 150, borderRadius: 5 },
    ],
  },
  '3shot-design2': {
    frame: '/designs/3shot-design2.png',
    frameWidth: 400,
    frameHeight: 650,
    windows: [
      { left: 40, top: 60, width: 320, height: 140, borderRadius: 8 },
      { left: 40, top: 260, width: 320, height: 140, borderRadius: 8 },
      { left: 40, top: 460, width: 320, height: 140, borderRadius: 8 },
    ],
  },
  '3shot-design3': {
    frame: '/designs/3shot-design3.png',
    frameWidth: 400,
    frameHeight: 650,
    windows: [
      { left: 60, top: 40, width: 280, height: 160, borderRadius: 12 },
      { left: 60, top: 240, width: 280, height: 160, borderRadius: 12 },
      { left: 60, top: 440, width: 280, height: 160, borderRadius: 12 },
    ],
  },
  '3shot-design4': {
    frame: '/designs/3shot-design4.png',
    frameWidth: 400,
    frameHeight: 650,
    windows: [
      { left: 45, top: 55, width: 310, height: 145, borderRadius: 3 },
      { left: 45, top: 255, width: 310, height: 145, borderRadius: 3 },
      { left: 45, top: 455, width: 310, height: 145, borderRadius: 3 },
    ],
  },
  '3shot-design5': {
    frame: '/designs/3shot-design5.png',
    frameWidth: 400,
    frameHeight: 650,
    windows: [
      { left: 55, top: 45, width: 290, height: 155, borderRadius: 15 },
      { left: 55, top: 245, width: 290, height: 155, borderRadius: 15 },
      { left: 55, top: 445, width: 290, height: 155, borderRadius: 15 },
    ],
  },

  // 4-shot designs
  '4shot-design1': {
    frame: '/designs/4shot-design1.png',
    frameWidth: 400,
    frameHeight: 700,
    windows: [
      { left: 50, top: 50, width: 300, height: 120, borderRadius: 5 },
      { left: 50, top: 200, width: 300, height: 120, borderRadius: 5 },
      { left: 50, top: 350, width: 300, height: 120, borderRadius: 5 },
      { left: 50, top: 500, width: 300, height: 120, borderRadius: 5 },
    ],
  },
  '4shot-design2': {
    frame: '/designs/4shot-design2.png',
    frameWidth: 400,
    frameHeight: 700,
    windows: [
      { left: 40, top: 60, width: 320, height: 110, borderRadius: 8 },
      { left: 40, top: 210, width: 320, height: 110, borderRadius: 8 },
      { left: 40, top: 360, width: 320, height: 110, borderRadius: 8 },
      { left: 40, top: 510, width: 320, height: 110, borderRadius: 8 },
    ],
  },
  '4shot-design3': {
    frame: '/designs/4shot-design3.png',
    frameWidth: 400,
    frameHeight: 700,
    windows: [
      { left: 60, top: 40, width: 280, height: 130, borderRadius: 12 },
      { left: 60, top: 190, width: 280, height: 130, borderRadius: 12 },
      { left: 60, top: 340, width: 280, height: 130, borderRadius: 12 },
      { left: 60, top: 490, width: 280, height: 130, borderRadius: 12 },
    ],
  },
  '4shot-design4': {
    frame: '/designs/4shot-design4.png',
    frameWidth: 400,
    frameHeight: 700,
    windows: [
      { left: 45, top: 55, width: 310, height: 115, borderRadius: 3 },
      { left: 45, top: 205, width: 310, height: 115, borderRadius: 3 },
      { left: 45, top: 355, width: 310, height: 115, borderRadius: 3 },
      { left: 45, top: 505, width: 310, height: 115, borderRadius: 3 },
    ],
  },
  '4shot-design5': {
    frame: '/designs/4shot-design5.png',
    frameWidth: 400,
    frameHeight: 700,
    windows: [
      { left: 55, top: 45, width: 290, height: 125, borderRadius: 20 },
      { left: 55, top: 195, width: 290, height: 125, borderRadius: 20 },
      { left: 55, top: 345, width: 290, height: 125, borderRadius: 20 },
      { left: 55, top: 495, width: 290, height: 125, borderRadius: 20 },
    ],
  },

  // 6-shot designs
  '6shot-design1': {
    frame: '/designs/6shot-design1.png',
    frameWidth: 400,
    frameHeight: 500,
    windows: [
      { left: 20, top: 20, width: 160, height: 120, borderRadius: 5 },
      { left: 220, top: 20, width: 160, height: 120, borderRadius: 5 },
      { left: 20, top: 170, width: 160, height: 120, borderRadius: 5 },
      { left: 220, top: 170, width: 160, height: 120, borderRadius: 5 },
      { left: 20, top: 320, width: 160, height: 120, borderRadius: 5 },
      { left: 220, top: 320, width: 160, height: 120, borderRadius: 5 },
    ],
  },
  '6shot-design2': {
    frame: '/designs/6shot-design2.png',
    frameWidth: 400,
    frameHeight: 500,
    windows: [
      { left: 25, top: 25, width: 150, height: 110, borderRadius: 8 },
      { left: 225, top: 25, width: 150, height: 110, borderRadius: 8 },
      { left: 25, top: 175, width: 150, height: 110, borderRadius: 8 },
      { left: 225, top: 175, width: 150, height: 110, borderRadius: 8 },
      { left: 25, top: 325, width: 150, height: 110, borderRadius: 8 },
      { left: 225, top: 325, width: 150, height: 110, borderRadius: 8 },
    ],
  },
  '6shot-design3': {
    frame: '/designs/6shot-design3.png',
    frameWidth: 400,
    frameHeight: 500,
    windows: [
      { left: 15, top: 15, width: 170, height: 130, borderRadius: 12 },
      { left: 215, top: 15, width: 170, height: 130, borderRadius: 12 },
      { left: 15, top: 165, width: 170, height: 130, borderRadius: 12 },
      { left: 215, top: 165, width: 170, height: 130, borderRadius: 12 },
      { left: 15, top: 315, width: 170, height: 130, borderRadius: 12 },
      { left: 215, top: 315, width: 170, height: 130, borderRadius: 12 },
    ],
  },
};

export default frameMappings;