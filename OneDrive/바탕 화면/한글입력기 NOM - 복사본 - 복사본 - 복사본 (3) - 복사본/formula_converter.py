# -*- coding: utf-8 -*-
"""
수식 변환 모듈
기존 hwp_auto_app.html의 JavaScript 변환 로직을 Python으로 포팅
"""

import re
from typing import Optional


class FormulaConverter:
    """수식 변환 클래스"""
    
    # 위첨자 문자 매핑
    SUPERSCRIPT_MAP = {
        '²': '^2', '³': '^3', '⁴': '^4', '⁵': '^5',
        '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9',
        '¹': '^1', '⁰': '^0'
    }
    
    # 단위 목록
    UNITS = [
        'cm', 'mm', 'm', 'km', 'in', 'ft', 'yd',
        'kg', 'g', 'mg', 'lb', 'oz',
        'l', 'ml', 'cc',
        'deg', 'rad',
        'sec', 'min', 'hr',
        'hz', 'v', 'a', 'w'
    ]
    # 단일 소문자 = 변수로 간주, rm 단위 변환 제외 (2a, 3x 등)
    
    def __init__(self, add_rm_prefix=False):
        """
        초기화
        
        Args:
            add_rm_prefix: RM 접두사 추가 여부
        """
        self.add_rm_prefix = add_rm_prefix
    
    def remove_outer_parentheses(self, text: str) -> str:
        """
        외부 괄호 제거
        
        Args:
            text: 입력 텍스트
            
        Returns:
            str: 괄호가 제거된 텍스트
        """
        text = text.strip()
        if text.startswith('(') and text.endswith(')'):
            depth = 0
            valid = True
            for i in range(len(text) - 1):
                if text[i] == '(':
                    depth += 1
                if text[i] == ')':
                    depth -= 1
                if depth == 0:
                    valid = False
                    break
            if valid and depth == 1:
                text = text[1:-1]
        return text
    
    def convert_spaces_to_backticks(self, text: str) -> str:
        """
        띄어쓰기를 백틱으로 변환 (보호할 패턴 제외)
        
        Args:
            text: 입력 텍스트
            
        Returns:
            str: 변환된 텍스트
        """
        # 보호할 패턴들
        protected_patterns = [
            (r'\}\s+over\s+\{', '} over {'),
            (r'\bbar\s+\{', 'bar {'),
            (r'\bsqrt\s+\{', 'sqrt {'),
            (r'\bbold\s+\{', 'bold {'),
            (r'\barch\s+\{', 'arch {'),
            (r'\bangle\s+\{', 'angle {')
        ]
        
        markers = []
        marker_index = 0
        temp_marker_prefix = '__TEMP_SPACE_MARKER_'
        converted = text
        
        # 보호할 패턴들을 임시 마커로 치환
        for pattern, replacement in protected_patterns:
            def replacer(match):
                nonlocal marker_index
                marker = f"{temp_marker_prefix}{marker_index}"
                markers.append((marker, replacement))
                marker_index += 1
                return marker
            
            converted = re.sub(pattern, replacer, converted)
        
        # 나머지 공백을 백틱으로 변환
        converted = converted.replace(' ', '`')
        
        # 임시 마커를 원래 패턴으로 복원
        for marker, value in markers:
            converted = converted.replace(marker, value)
        
        return converted
    
    def convert_all_to_bar(self, text: str) -> str:
        """
        2개 이상의 연속 문자를 bar{}로 변환
        
        Args:
            text: 입력 텍스트
            
        Returns:
            str: 변환된 텍스트
        """
        # 분수 형식 보호
        temp_marker_prefix = '__TEMP_OVER_MARKER_'
        markers = []
        marker_index = 0
        
        def protect_over(match):
            nonlocal marker_index
            marker = f"{temp_marker_prefix}{marker_index}"
            markers.append((marker, match.group(0)))
            marker_index += 1
            return marker
        
        converted = re.sub(r'\{[^}]+\}\s+over\s+\{[^}]+\}', protect_over, text)
        
        # 대소문자, 작은따옴표, 아래첨자를 포함한 문자열 패턴
        pattern = r'[A-Za-z]+(?:\'[A-Za-z]*)*(?:[₀₁₂₃₄₅₆₇₈₉]+)?'
        
        def convert_match(match):
            matched_text = match.group(0)
            
            # 마커인지 확인
            if matched_text.startswith(temp_marker_prefix):
                return matched_text
            
            # 앞뒤 문맥 확인
            start_pos = match.start()
            before = text[max(0, start_pos - 10):start_pos]
            
            # 이미 bar{} 안에 있는지 확인
            if re.search(r'bar\s*\{[^}]*$', before):
                return matched_text
            
            # 단위인지 확인
            if matched_text.lower() in self.UNITS:
                return matched_text
            
            # 알파벳 문자가 정확히 2개인 경우만 변환
            alphabet_count = len(re.findall(r'[A-Za-z]', matched_text))
            if alphabet_count != 2:
                return matched_text
            
            # 소문자만으로 이루어진 2글자는 변환하지 않음
            if re.match(r'^[a-z]{2}$', matched_text):
                return matched_text
            
            # 변환: bar {문자열}로 감싸기
            return f'bar {{{matched_text}}}'
        
        converted = re.sub(pattern, convert_match, converted)
        
        # 임시 마커를 원래 패턴으로 복원
        for marker, value in markers:
            converted = converted.replace(marker, value)
        
        return converted
    
    def convert_to_custom_format(self, text: str) -> str:
        """
        수식을 커스텀 형식으로 변환 (메인 변환 함수)
        
        Args:
            text: 입력 텍스트
            
        Returns:
            str: 변환된 텍스트
        """
        result = text

        # 강조표시 ** → * 정규화 (이후 * → TIMES 변환과 통일)
        result = result.replace('**', '*')

        # bar {내용}^숫자 → {bar {내용}}^숫자 변환 (위첨자가 선분에 올바르게 적용되도록)
        result = re.sub(r'bar\s*\{([^}]+)\}\^(\d+)', r'{bar {\1}}^\2', result)

        # ── Bar-fraction marker protection ──
        # {bar {XX}} patterns break the fraction regex (which excludes {}).
        # Replace them with simple markers, run fraction conversion, then restore.
        _bar_frac_markers = []
        _bar_frac_prefix = '__BARFRAC_'

        def _protect_bar_group(match):
            idx = len(_bar_frac_markers)
            marker = f'{_bar_frac_prefix}{idx}__'
            _bar_frac_markers.append((marker, match.group(0)))
            return marker

        # Protect {bar {XX}} patterns (with or without trailing ^N which stays outside)
        result = re.sub(r'\{bar \{[^}]+\}\}', _protect_bar_group, result)
        # Also protect bare bar {XX} that wasn't wrapped (no superscript case)
        result = re.sub(r'bar \{[^}]+\}', _protect_bar_group, result)

        # 유니코드 마이너스/하이픈 → ASCII 하이픈-마이너스 (후속 정규식 호환)
        result = result.replace('\u2212', '-')  # U+2212 MINUS SIGN
        result = result.replace('\u2010', '-')  # U+2010 HYPHEN
        
        # bar {} 안의 작은따옴표는 보호하고, 선분 패턴([A-Za-z]'[A-Za-z]')도 보호
        # bar {} 안의 내용을 임시 마커로 보호
        temp_marker_prefix = '__BAR_CONTENT_MARKER_'
        bar_markers = []
        marker_index = 0
        
        def protect_bar_content(match):
            nonlocal marker_index
            marker = f"{temp_marker_prefix}{marker_index}"
            bar_markers.append((marker, match.group(0)))
            marker_index += 1
            return marker
        
        # bar {내용} 패턴을 임시 마커로 보호
        result = re.sub(r'bar\s*\{([^}]+)\}', protect_bar_content, result)
        
        # 선분 패턴([A-Za-z]'[A-Za-z]')도 보호 (예: G'H', A'B')
        def protect_segment_pattern(match):
            nonlocal marker_index
            marker = f"{temp_marker_prefix}{marker_index}"
            bar_markers.append((marker, match.group(0)))
            marker_index += 1
            return marker
        
        # 선분 패턴을 임시 마커로 보호
        result = re.sub(r"[A-Za-z]'[A-Za-z]'", protect_segment_pattern, result)
        
        # 보호되지 않은 작은따옴표를 도 기호로 변환
        result = re.sub(r"[''\u0027\u2018\u2019]", '°', result)
        
        # 보호된 내용 복원
        for marker, value in bar_markers:
            result = result.replace(marker, value)
        
        # 샵을 각도 기호로 변환
        result = result.replace('#', '∠')
        
        # 이중 슬래시를 평행선 기호로 변환
        result = result.replace('//', '⫽')

        # * 기호를 TIMES로 변환 (분수 변환 전에 수행 - 2*3*4*1/2 등 공백 기반 분수 해석에 필요)
        result = re.sub(r'\*', 'TIMES', result)

        # 분수 변환: -6/-6 → { - 6} over { - 6},  - 6/-6 → - {6} over { - 6}, / 전후 띄어쓰기·백틱 허용
        # 백틱(`)을 공백과 동일한 토큰 경계로 처리 (2*3*4* 1/2 → 2*3*4*{1}over{2})
        def format_num_for_over(s: str):
            t = s.replace('`', '').strip()
            if re.match(r'^-\s+', t):
                return ('- ', '{' + re.sub(r'^-\s+', '', t).strip() + '}')
            if re.match(r'^-[^\s]', t):
                return ('', '{ - ' + t[1:].strip() + '}')
            if t.startswith('+'):
                return ('', '{' + re.sub(r'^\+', '', t).strip() + '}')
            return ('', '{' + t + '}')

        def format_den_for_over(s: str):
            t = s.replace('`', '').strip()
            if re.match(r'^-\s*', t):
                return '{ - ' + re.sub(r'^-\s*', '', t).strip() + '}'
            if t.startswith('+'):
                return '{' + re.sub(r'^\+', '', t).strip() + '}'
            return '{' + t + '}'

        def fraction_repl(m):
            num, den = m.group(1), m.group(2)
            if '//' in m.group(0) or 'over' in num or 'over' in den:
                return m.group(0)
            superscript_pat = r'\^(\d+)$'
            num_sup = re.search(superscript_pat, num)
            den_sup = re.search(superscript_pat, den)
            num_clean = re.sub(superscript_pat, '', num)
            den_clean = re.sub(superscript_pat, '', den)
            num_core = re.sub(r'^[+\-]\s*', '', num_clean.replace('`', '').strip())
            den_core = re.sub(r'^[+\-]\s*', '', den_clean.replace('`', '').strip())
            if re.search(r'[+\-*]', num_core) or re.search(r'[+\-*]', den_core):
                return m.group(0)
            prefix, num_body = format_num_for_over(num_clean)
            den_body = format_den_for_over(den_clean)
            # 분자/분모에 각각 위첨자 붙이기
            if num_sup:
                num_body = num_body + '^' + num_sup.group(1)
            if den_sup:
                den_body = den_body + '^{' + den_sup.group(1) + '}'
            return prefix + num_body + ' over ' + den_body

        # Parenthesized fraction: (num/den) → LEFT ( {num} over {den} RIGHT )
        def paren_fraction_repl(m):
            content = m.group(1)
            if '//' in content or 'over' in content:
                return m.group(0)
            parts = content.split('/', 1)
            if len(parts) != 2:
                return m.group(0)
            num_part = parts[0].strip()
            den_part = parts[1].strip()
            # Skip if num or den contains operators (complex expressions)
            num_core = re.sub(r'^[+\-]\s*', '', num_part)
            den_core = re.sub(r'^[+\-]\s*', '', den_part)
            if re.search(r'[+\-*]', num_core) or re.search(r'[+\-*]', den_core):
                return m.group(0)
            # Extract superscripts
            sup_pat = r'\^(\d+)$'
            num_sup = re.search(sup_pat, num_part)
            den_sup = re.search(sup_pat, den_part)
            num_clean = re.sub(sup_pat, '', num_part)
            den_clean = re.sub(sup_pat, '', den_part)
            num_body = '{' + num_clean + '}'
            den_body = '{' + den_clean + '}'
            if num_sup:
                num_body += '^' + num_sup.group(1)
            if den_sup:
                den_body += '^{' + den_sup.group(1) + '}'
            return 'LEFT ( ' + num_body + ' over ' + den_body + ' RIGHT )'

        result = re.sub(r'\(([^()]+)\)', paren_fraction_repl, result)

        result = re.sub(r'([^\s`{}\/]+)[\s`]*/[\s`]*([^\s`{}\/]+)', fraction_repl, result)

        # ── Restore bar-fraction markers ──
        # When fraction_repl wraps a marker in {}, e.g. {__BARFRAC_0__}, and the
        # stored value already has outer braces (e.g. {bar {AE}}), naive replacement
        # would produce {{bar {AE}}}. Detect and collapse the double braces.
        for marker, value in _bar_frac_markers:
            wrapped = '{' + marker + '}'
            if wrapped in result and value.startswith('{') and value.endswith('}'):
                result = result.replace(wrapped, value)
            result = result.replace(marker, value)

        # ellipsis를 cdots로 변환 (특수문자 먼저 변환)
        result = result.replace('…', 'cdots')  # U+2026 HORIZONTAL ELLIPSIS
        result = result.replace('···', 'cdots')  # U+00B7 x 3 MIDDLE DOT x 3
        # 일반 점 3개를 cdots로 변환
        result = result.replace('...', 'cdots')
        
        # 제곱센티미터 기호(㎠)를 cm^2로 변환 (위첨자 변환 전에 처리)
        result = result.replace('㎠', 'cm^2')  # U+33A0 SQUARE CM
        
        # 위첨자 문자를 ^숫자 형식으로 변환
        for sup, replacement in self.SUPERSCRIPT_MAP.items():
            result = result.replace(sup, replacement)
        
        # 모든 단위 변환: rm 접두사(로마체) 추가, 숫자와 단위 사이에 백틱(`) 추가
        # 마커를 사용하여 이미 변환된 단위가 재매칭되는 것을 방지
        _RM = '__RM_UNIT__'

        # 긴 단위부터 매칭하여 cm이 m보다 먼저 매칭되도록 정렬
        units_sorted = sorted(self.UNITS, key=len, reverse=True)
        units_pat = '|'.join(re.escape(u) for u in units_sorted)
        multi_units = [u for u in units_sorted if len(u) >= 2]
        multi_pat = '|'.join(re.escape(u) for u in multi_units)

        # 1a) 숫자+unit^N (예: 6cm^2 → 6`rmcm ^2)
        def num_unit_pow_repl(m):
            u_raw, u = m.group(2), m.group(2).lower()
            if len(u) == 1 and u_raw.islower():
                return m.group(0)
            return f'{m.group(1)}`{_RM}{u} ^{m.group(3)} '
        result = re.sub(
            r'(?i)(\d+(?:\.\d+)?)(' + units_pat + r')\^(\d+)',
            num_unit_pow_repl,
            result
        )

        # 1b) 문자+multi_unit^N (예: xcm^2 → x`rmcm ^2)
        # 대문자 단위(예: ABCM의 CM)는 기하 기호이므로 변환 제외
        if multi_pat:
            def char_multi_unit_pow_repl(m):
                u_raw = m.group(2)
                if len(u_raw) >= 2 and u_raw != u_raw.lower():
                    return m.group(0)
                return f'{m.group(1)}`{_RM}{u_raw.lower()} ^{m.group(3)} '
            result = re.sub(
                r'(?i)([a-zA-Z])(' + multi_pat + r')\^(\d+)',
                char_multi_unit_pow_repl,
                result
            )

        # 1c) standalone unit^N (예: cm^2 → rmcm ^2)
        def standalone_unit_pow_repl(m):
            u_raw, u = m.group(1), m.group(1).lower()
            if len(u) == 1 and u_raw.islower():
                return m.group(0)
            return f'{_RM}{u} ^{m.group(2)} '
        result = re.sub(
            r'(?i)(' + units_pat + r')\^(\d+)',
            standalone_unit_pow_repl,
            result
        )

        # 2) 숫자+unit (예: 6cm → 6`rmcm, 10kg → 10`rmkg)
        # 단일 소문자는 변수로 간주하여 rm 변환 제외 (2a → 2a, 10A → 10`rma`은 유지)
        def num_unit_repl(m):
            u_raw, u = m.group(2), m.group(2).lower()
            if len(u) == 1 and u_raw.islower():
                return m.group(0)
            return f'{m.group(1)}`{_RM}{u}'
        result = re.sub(
            r'(?i)(\d+(?:\.\d+)?)(' + units_pat + r')\b',
            num_unit_repl,
            result
        )

        # 3) 문자+multi_unit (예: xcm → x`rmcm)
        # 대문자 단위(예: ABCM의 CM)는 기하 기호이므로 변환 제외
        if multi_pat:
            def char_multi_unit_repl(m):
                u_raw = m.group(2)
                if len(u_raw) >= 2 and u_raw != u_raw.lower():
                    return m.group(0)
                return f'{m.group(1)}`{_RM}{u_raw.lower()}'
            result = re.sub(
                r'(?i)([a-zA-Z])(' + multi_pat + r')\b',
                char_multi_unit_repl,
                result
            )

        # 4) standalone multi_unit (예: cm → rmcm)
        # 대문자 단위(예: CM)는 기하 기호이므로 변환 제외
        def standalone_unit_repl(m):
            u_raw, u = m.group(1), m.group(1).lower()
            if len(u) == 1 and u_raw.islower():
                return m.group(0)
            if len(u_raw) >= 2 and u_raw != u_raw.lower():
                return m.group(0)
            return f'{_RM}{u}'
        if multi_pat:
            result = re.sub(
                r'(?i)\b(' + multi_pat + r')\b',
                standalone_unit_repl,
                result
            )

        # 마커를 실제 rm으로 변환
        result = result.replace(_RM, 'rm')

        # sqrt 변환
        result = re.sub(r'sqrt\(([^)]+)\)', r'sqrt{\1}', result)
        
        # * → TIMES는 분수 변환 전에 이미 수행됨. TIMES 연산자 주변 공백 추가
        result = re.sub(r'([^\s])TIMES([^\s])', r'\1 TIMES \2', result)
        
        # 등호·연산자를 공백으로 감싼 형태로 (이미 공백/백틱인 경우 제외)
        # `op` 대신 ` op ` (공백) 사용 - HWP 수식 가독성 향상
        result = re.sub(r'(?<![`\s])=(?![`\s])', ' = ', result)
        result = re.sub(r'(?<![`\s])\+(?![`\s])', ' + ', result)
        result = re.sub(r'(?<![`\s])\-(?![`\s])', ' - ', result)
        for op in ':><\u00d7\u00f7|':
            result = re.sub(r'(?<![`\s])' + re.escape(op) + r'(?![`\s])', ' ' + op + ' ', result)
        
        # 기존 `op` 형태(띄어쓰기→백틱 변환 결과)를 공백으로 통일
        for op in '=+-:><\u00d7\u00f7|':
            result = result.replace('`' + op + '`', ' ' + op + ' ')
        
        # 단일 연산자만 있는 경우 공백으로 감쌈 (/, ^는 분수·위첨자용으로 제외)
        op_only = result.replace('`', '').replace(' ', '').strip()
        if len(op_only) == 1 and op_only in ':+-=><\u00d7\u00f7|':
            result = ' ' + op_only + ' '
        
        # 독립된 대문자 알파벳을 로마체(rm)로 변환 (예: O → rmO, S → rmS)
        # 다른 문자에 인접한 대문자, bar {} 내부, HWP 명령어(TIMES 등)는 제외
        result = re.sub(r'(?<![a-zA-Z{])([A-Z])(?![a-zA-Z])', r'rm\1', result)

        # 연속된 공백을 하나로 정리
        result = re.sub(r'\s+', ' ', result)
        result = result.strip()

        return result
    
    def convert_formula(self, text: str) -> str:
        """
        전체 변환 파이프라인 실행
        
        Args:
            text: 입력 텍스트
            
        Returns:
            str: 변환된 텍스트
        """
        # 1. 띄어쓰기 인식
        converted = self.convert_spaces_to_backticks(text)
        
        # 2. 선분으로 모두 바꾸기
        converted = self.convert_all_to_bar(converted)
        
        # 3. 수식 변환
        converted = self.convert_to_custom_format(converted)
        
        # 4. RM 접두사 추가 (옵션)
        if self.add_rm_prefix and not converted.upper().startswith('RM'):
            converted = 'RM' + converted
        
        return converted
    
    def convert_variable_to_formula(self, variable: str) -> str:
        """
        변수명을 수식 형식으로 변환
        
        Args:
            variable: 변수명
            
        Returns:
            str: 수식 형식으로 변환된 변수
        """
        # 이미 수식 형식인 경우 그대로 반환
        if '{' in variable or 'bar' in variable.lower():
            return variable
        
        # 단일 문자나 대문자 2글자는 bar{}로 감싸기
        if len(variable) == 1 or (len(variable) == 2 and variable.isupper()):
            return f'bar {{{variable}}}'
        
        # 그 외는 그대로 반환
        return variable
    
    def convert_number_unit_to_formula(self, number: str, unit: str) -> str:
        """
        숫자+단위를 수식 형식으로 변환

        Args:
            number: 숫자
            unit: 단위

        Returns:
            str: 수식 형식으로 변환된 텍스트
        """
        # 숫자`rm단위 형식으로 변환 (백틱 띄어쓰기 + 로마체)
        return f'{number}`rm{unit.lower()}'


def convert_text_to_formula(text: str, add_rm_prefix: bool = False) -> str:
    """
    텍스트를 수식 형식으로 변환 (편의 함수)
    
    Args:
        text: 입력 텍스트
        add_rm_prefix: RM 접두사 추가 여부
        
    Returns:
        str: 변환된 텍스트
    """
    converter = FormulaConverter(add_rm_prefix=add_rm_prefix)
    return converter.convert_formula(text)


if __name__ == "__main__":
    # 테스트 코드
    test_cases = [
        "AB = 6cm",
        "x를 구하여라",
        "△ABC에서 AB = 6cm",
        "bar {AB} = 6 cm"
    ]
    
    converter = FormulaConverter()
    
    for test_text in test_cases:
        print(f"\n=== 입력: {test_text} ===")
        converted = converter.convert_formula(test_text)
        print(f"출력: {converted}")

