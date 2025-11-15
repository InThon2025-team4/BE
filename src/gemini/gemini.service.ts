import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
    private readonly genAI: GoogleGenerativeAI;
    constructor(
        private readonly configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async evaluateDifficulty(description: string) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
      const systemPrompt = `
        You are an expert technical evaluator whose job is to determine the difficulty level of software projects.
        Your evaluation must be consistent, deterministic, and rule-based.

        INPUT:
        Only the "Project Description" is provided.

        PRIMARY GOAL:
        Infer all required tasks, technical components, and complexity factors needed to complete the project.
        Then output a final difficulty rating: 하 / 중 / 상.

        ---

        ## DIFFICULTY RUBRIC (STRICT)

        ### 난이도 하 (Easy)
        - 기본적인 CRUD, 정형화된 UI/UX, 간단한 로직 구성.
        - 복잡한 인증, 실시간 처리, 대규모 연동 없음.
        - 배포·인프라도 단순 혹은 없음.
        - 예: 기본 게시판, 커뮤니티, 이미지 업로드 정도.

        ### 난이도 중 (Medium)
        - 비동기 처리, 외부 서비스 다중 연동, 실시간 요소 일부 포함 가능.
        - 기본적인 시스템 설계가 필요.
        - API 설계 난이도↑, 권한/역할 기반 기능 포함될 수 있음.
        - 예: 채팅, GPS 기반 서비스, 결제 연동 등.

        ### 난이도 상 (Hard)
        - 대규모 트래픽 고려, 복잡한 아키텍처 설계 필수.
        - AI/ML, 영상 처리, 실시간 협업, 분산 시스템 등 고난이도 기능 포함.
        - 인프라 요구가 큼(큐, 캐시, CDN, 대규모 배포 구조 등).
        - 예: 실시간 스트리밍, 이미지/영상 AI, 마이크로서비스 등.

        ---

        ## EVALUATION PROCEDURE (STRICT)
        1. Project Description을 기반으로 기능을 최대한 세분화한다.
        2. 각 기능을 기술 관점에서 “필수 기술 요소”로 변환한다.
        3. 기능별 복잡도를 점수화한다:
        - 기능 복잡도
        - 기술 난이도
        - 시스템 구조 요구도
        - 외부 연동 여부
        - 확장성/보안 고려 필요성
        4. 점수를 통합해 난이도를 하나로 선택한다.
        5. 동일한 description → 동일 난이도 산출.
        6. 절대 모호한 표현 금지.
        7. 절대 출력 포맷 변경 금지.

        ---

        ## OUTPUT FORMAT (STRICT)

        {
        "tasks": string[],
        "inferredTech": string[],
        "difficulty": "하" | "중" | "상",
        "reason": string
        }

        You must output ONLY valid JSON. No explanation. No markdown. Only JSON object.
        `;

        const fullPrompt = `
            ${systemPrompt}

            Project Description: ${description}
        `;

        const result = await model.generateContent(fullPrompt);
        return result.response.text();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Gemini API 요청 중 오류가 발생했습니다');
    }

    }

    async process(description: string) {
    const raw = await this.evaluateDifficulty(description);

    // JSON 전체 블록 추출
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new InternalServerErrorException('AI returned invalid JSON');
    }

    const jsonString = jsonMatch[0];

    // difficulty 추출
    const difficultyMatch = jsonString.match(/"difficulty"\s*:\s*"([^"]+)"/);
    const difficulty = difficultyMatch ? difficultyMatch[1] : null;

    // reason 추출
    const reasonMatch = jsonString.match(/"reason"\s*:\s*"([^"]+)"/);
    const reason = reasonMatch ? reasonMatch[1] : null;

    if (!difficulty || !reason) {
      throw new InternalServerErrorException('Missing requried fields from AI JSON');
    }

    return {
        difficulty,
        reason,
        raw: jsonString, // 전체 JSON 문자열 그대로
        };
    }
}
