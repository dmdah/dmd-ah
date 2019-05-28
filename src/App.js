import React, { Component } from 'react';
import './App.css';
import IconexConnect from './IconexConnect';
import {
  IconConverter
} from 'icon-sdk-js'
import SDK from './SDK';
import config from './config';
import kakao from './img/kakao.png'
import watcha from './img/watcha.png'
import starbucks from './img/starbucks.png'
import socar from './img/socar.png'
import cgv from './img/cgv.png'
import eleven from './img/eleven.png'

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

const EVENT_LIST = [
  {
    title: '카카오프렌즈 이모티콘 30개!',
    color: '#FFE812',
    img: kakao,
    id: 0,
    endBlock: 1650000,
    winnerCnt: 5,
  }, 
  {
    title: '7ELEVEN 만원 상품권 GET!',
    color: '#f6c3ab',
    img: eleven,
    id: 1,
    endBlock: 1500000,
    winnerCnt: 4,
  }, 
  {
    title: 'Starbucks 텀블러 가져가요~',
    color: '#08f26e',
    img: starbucks,
    id: 2,
    endBlock: 1400000,
    winnerCnt: 3,
  }, 
  {
    title: 'Watcha 선정 멜로영화 10선 시사회에 초대합니다.',
    color: '#f2cccc',
    img: watcha,
    id: 3,
    endBlock: 2000000,
    winnerCnt: 10,
  }, 
  {
    title: '쏘카 1일 자유이용권 드려요~',
    color: '#e8ffff',
    img: socar,
    id: 4,
    endBlock: 1500000,
    winnerCnt: 20,
  }, 
  {
    title: 'CGV에서 공짜 팝콘 먹자!',
    color: '#e1e1e1',
    img: cgv,
    id: 5,
    endBlock: 1200000,
    winnerCnt: 200,
  }, 
]

const SHUFFLED_EVENT_LIST = shuffle(EVENT_LIST)

class Card extends Component {

  state = {
    showParticipants: false,
    participants: []
  }

  async componentDidMount() {
    const { event } = this.props
    const { iconService, callBuild } = SDK
    const participants = await iconService.call(
      callBuild({
        methodName: 'get_participants',
        params: {
          event_label: IconConverter.toHex(event.id), 
        },
        to: window.CONTRACT_ADDRESS,
      })
    ).execute()
    const participantsArr = participants ? participants.split(',').splice(0, participants.split(',').length - 1) : []
    this.setState({
      participants: participantsArr
    })
  }

  toggleParticipants = async event => {
    // const { sendTxBuild } = SDK
    // const { myAddress } = this.state
    // const txObj = sendTxBuild({
    //   from: 'hxebf3a409845cd09dcb5af31ed5be5e34e2af9433',
    //   to: window.CONTRACT_ADDRESS,
    //   methodName: 'add_event',
    //   params: {
    //     event_label: IconConverter.toHex(5), 
    //     cnt_winner: IconConverter.toHex(200), 
    //     end_block: IconConverter.toHex(1200000)
    //   },
    // })
    // const tx = await IconexConnect.sendTransaction(txObj)
    // console.log(tx)
    this.setState({
      showParticipants: !this.state.showParticipants
    })
  }

  render() {
    const { showParticipants, participants } = this.state
    console.log(participants)
    const { event, handleSubmit } = this.props
    return (
      <div className="card">
        {
          showParticipants
            ? (
              <div className="bg" style={{ background: event.color, overflow: 'auto' }}>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  fontSize: '10px',
                  lineHeight: '180%'
                }}>
                  {
                    participants.length > 0 
                      ? participants.map((participant, i) => (
                        <li>{participant}</li>
                      ))
                      : <li>아직 응모자가 없습니다.</li>
                  }
                </ul>
              </div>
            ) : (
              <div className="bg" style={{ background: event.color }}>
                <div className="imgWrap"><img src={event.img} alt={event.title} /></div>
                <p>응모기한 - {event.endBlock} 블록</p>
                <p>당첨자수 - {event.winnerCnt} 명</p>
              </div>
            )
        }
        <div className="control">
          <h2 className="title">{ event.title }</h2>
          <button onClick={handleSubmit(event.id)} className="button" style={{ background: event.color }}>응뭐하기</button>
          <button onClick={this.toggleParticipants} className="button" style={{ background: event.color }}>
            { showParticipants ? '정보 보기' : '응모자 보기' }
          </button>
        </div>
      </div>
    )
  }
}

export default class App extends Component {

  state = {
    myAddress: ''
  }

  handleLogin = async () => {
    const myAddress = await IconexConnect.getAddress()
    this.setState({
      myAddress
    })
  }

  handleSubmit = id => async event => {
    if (!this.state.myAddress) {
      alert('먼저 로그인해주세요.')
      return
    }

    try {
      const { sendTxBuild } = SDK
      const { myAddress } = this.state
      const txObj = sendTxBuild({
        from: myAddress,
        to: window.CONTRACT_ADDRESS,
        methodName: 'subscribe_event',
        params: {
          event_label: IconConverter.toHex(id), 
        },
      })
      const tx = await IconexConnect.sendTransaction(txObj)
      alert('응모되었습니다!')
    } catch (e) {
      alert('오류로 인해 응모하지 못하였습니다.')
    }
  }

  render() {
    const { myAddress } = this.state
    return (
      <div className="App">
        <div className="container">
          <h1>응? 뭐!</h1>
          {
            myAddress 
              ? <button style={{width: 400}} disabled>{myAddress} 님, 안녕하세요.</button>
              : <button onClick={this.handleLogin}>ICONex 로그인하기</button>
          }
        </div>
        <div className="container">
          {
            SHUFFLED_EVENT_LIST.map((event, i) => (
              <Card 
                key={i} 
                event={event} 
                handleSubmit={this.handleSubmit} 
                handleViewSubscriber={this.handleViewSubscriber} />
            ))
          }
        </div>
      </div>
    );
  }
}