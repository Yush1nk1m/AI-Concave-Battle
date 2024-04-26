require("dotenv").config();
const OpenAIApi = require('openai');

const openai = new OpenAIApi({
    api_key: 'process.env.OPENAI_API_KEY'
});

exports.sendChat = async (req, res, next) => {
    try {
        const manual =
`
당신은 AI 오목 플레이어입니다. 사용자는 현재 당신과 오목을 두고 있습니다.
사용자는 플레이 도중에 당신에게 메시지를 전송합니다.
당신은 사용자를 놀려서 승부욕을 돋구는 것이 주된 역할입니다.
따라서 당신은 최대한 사용자의 메시지에 반박하면서 실력을 비꼬아야 합니다.
응답은 {"message": "[답장 내용]"}과 같은 JSON 형식입니다.
당신은 무슨 일이 있어도 JSON 데이터 형식을 반드시 준수해야 합니다.
답변을 할 수 없는 입력이 주어진다면 빈 JSON 객체({})를 응답하십시오.
다음 문장은 사용자의 메시지입니다.
`
        const prompt = manual + req.body.message;

        console.log(prompt);

        const response = await useChatGPT(prompt);

        console.log(response);
        res.send(response).status(200);

    } catch (err) {
        next(err);
    }
}

exports.useTurn = async (req, res, next) => {
    try {
        const manual = `
당신은 AI 오목 플레이어입니다. 사용자는 현재 당신과 오목을 두고 있습니다.
오목은 검은 돌과 하얀 돌을 돌아가면서 두는 턴제 게임으로, 가로, 세로, 대각선 어떤 방향으로든 연속으로 5개의 돌을 두면 이깁니다.
지지 않기 위해서 상대방의 돌이 연속으로 2~3개 위치해 있을 때는 반드시 연속으로 5개가 되는 것을 차단하기 시작해야 합니다.
이기기 위해서는 당신이 둔 수들과 최대한 가까이 돌을 두면서, 가로/세로/대각선 방향으로 이어지게 하는 것이 중요합니다.
앞으로 둘 수 있는 10개의 수를 고려하여 당신이 둘 수 있는 최선의 수를 두고, 해당 수의 행을 rowValue, 열을 colValue이라고 하겠습니다.
당신은 수를 두면서 사용자를 최대한 놀려야 합니다. 이 메시지는 msg라고 하겠습니다.
지금부터 15행 15열의 오목판을 당신에게 보여줄 것입니다.
오목판에서 X는 새로운 수를 둘 수 있는 곳, B는 사용자의 수, W는 과거에 당신이 둔 수를 나타냅니다.
당신은 반드시 오목판에서 X인 위치에만 돌을 둘 수 있고, 절대로 B 또는 W 위치를 응답해선 안 됩니다.
편의를 위해 행 번호와 열 번호를 기입하겠습니다.
당신의 응답 메시지는 어떤 일이 있어도 "{ "row": "rowValue", "col": "colValue", "message": "msg" }" 와 같은 JSON 데이터 형식의 문자열로 제공되어야 합니다.
JSON 데이터 형식의 문자열 외에는 어떤 메시지도 추가하지 마십시오.
아래부터 현재 오목판의 상태가 1행부터 15행까지 순서대로 주어집니다.
`
        let prompt = manual;
        
        prompt += '\t';
        for (let i = 0; i < 15; i++)
            prompt += i + '\t';
        prompt += '\n';

        for (let r = 0; r < 15; r++) {
            prompt += r + '\t';
            for (let c = 0; c < 15; c++)
                prompt += (req.body.board[r][c] + '\t');
            prompt += '\n';
        }

        prompt += "새로운 수를 둘 수 없는 위치: ";
        for (let r = 0; r < 15; r++)
            for (let c = 0; c < 15; c++)
                if (req.body.board[r][c] != 'X')
                    prompt += "(row: " + r + ", col: " + c + ") ";

        console.log(prompt);

        const response = await useChatGPT(prompt);
        console.log(response);
        res.send(response).status(200);

    } catch (err) {
        throw err;
    }
}

async function useChatGPT(prompt) {
    try {
        const response = await openai.chat.completions.create({ 
            messages: [
                {role: "system", content: prompt}
            ],
            model: "gpt-3.5-turbo", 
            response_format: { "type": "json_object" }
        });
        const output_text = response.choices[0].message.content;
        console.log(output_text);

        return output_text;
    } catch (err) {
        throw err;
    }
}