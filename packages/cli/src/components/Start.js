/*
  @flow
  @jsx h
*/

import { Component, Text, h } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';

import { startApp } from '../utils/async-pm2';
import validate from '../utils/validations';
import PrintJSON from './PrintJSON';
import Quit from './Quit';

type StartArgs = {
  _: string[],
  name?: string,
  redis?: string,
  port?: number,
  burstTime?: number,
  burstCount?: number,
  workers?: number,
};

type Props = {
  args: StartArgs,
};

type State = {
  errors: any,
  currentAnswer: string,
  currentQuestion: string,
  name: string,
  redis: string,
  port: string,
  burstTime: string,
  burstCount: string,
  workers: string,
  apps: Array<{
    pid: number,
  }>,
};

type QuestionEnum = 'name' | 'redis' | 'port';

const nextQuestions = question => {
  const questions = [
    'name',
    'redis',
    'port',
    'burstTime',
    'burstCount',
    'workers',
  ];
  const currentIndex = questions.indexOf(question);
  return questions[currentIndex + 1];
};

const defaultsOf = question => {
  return {
    redis: 'redis://localhost:6379/0',
    port: '30890',
    burstTime: '500',
    burstCount: '20',
    workers: '1',
  }[question];
};

const labelOf = question => {
  return {
    name: 'App Name',
    redis: 'Redis URL',
    port: 'HTTP port',
    burstTime: 'Burst Time',
    burstCount: 'Burst Count',
    workers: 'Number of workers',
  }[question];
};

const placeholderOf = question => {
  const def = defaultsOf(question);

  return (
    {
      name: 'your app name',
      redis: 'full redis connection string',
      port: 'http port for this app to listen',
      burstTime:
        'maximum buffer wait time (in milliseconds) before sending message',
      burstCount: 'maximum number of events can be sent in one message',
      workers: 'specify the number of processes running in background',
    }[question] + `${def ? `. Default: ${def}` : ''}`
  );
};

export default class Start extends Component {
  constructor(props: Props) {
    super(props);

    this.state = {
      validating: false,
      currentAnswer: props.args.name || '',
      currentQuestion: 'name',
      name: props.args.name,
      redis: props.args.redis,
      port: String(props.args.port || ''),
      burstTime: String(props.args.burstTime || ''),
      burstCount: String(props.args.burstCount || ''),
      workers: String(props.args.workers || ''),
    };
  }

  handleChange = (val: string) => {
    if (this.state.validating) {
      return;
    }
    this.setState({ currentAnswer: val.split(' ').join('-') });
  };

  handleSubmit = async (val: string) => {
    const { currentQuestion } = this.state;

    const finalValue = val || defaultsOf(currentQuestion);

    this.setState({ validating: true });
    const errors = await validate(currentQuestion, finalValue);
    this.setState({ validating: false, errors, currentAnswer: '' });

    if (errors) {
      return;
    }

    const nextQuestion = nextQuestions(currentQuestion);

    this.setState({
      [currentQuestion]: finalValue,
      currentQuestion: nextQuestion,
      currentAnswer: this.state[nextQuestion] || '',
    });

    if (nextQuestion) {
      return;
    }

    const args = buildArgs(this.state);
    this.setState({ status: 'STARTING', currentQuestion: null }, async () => {
      const apps = await startApp(
        this.state.name,
        args,
        Number(this.state.workers),
        true
      );
      this.setState({ status: 'STARTED', apps });
    });
  };

  render({ args }: Props, state: State) {
    if (state.currentQuestion) {
      return (
        <div>
          {state.errors &&
            <div>
              {state.errors}
            </div>}
          <div>
            <Text bold>
              {labelOf(state.currentQuestion)}:{' '}
            </Text>
            <TextInput
              placeholder={placeholderOf(state.currentQuestion)}
              value={state.currentAnswer}
              onChange={this.handleChange}
              onSubmit={this.handleSubmit}
            />
          </div>
          {state.validating &&
            <div>
              <Spinner green />{' '}
              <Text green>Validating {state.currentQuestion}</Text>
            </div>}
        </div>
      );
    }

    if (state.status === 'STARTING') {
      return (
        <div>
          <Spinner green /> Starting {state.name} ⨉ {state.workers}{' '}
          instance(s)...
        </div>
      );
    }

    return (
      <div>
        <Text green>
          {state.name} started {state.apps.length} instance(s) on port{' '}
          {state.port}.
        </Text>
        <Quit />
      </div>
    );
  }
}

const buildArgs = ({ name, redis, port, burstTime, burstCount }: State) => {
  return `--name ${name} --redis ${redis} --port ${port} --burstTime ${burstTime} --burstCount ${burstCount}`;
};
