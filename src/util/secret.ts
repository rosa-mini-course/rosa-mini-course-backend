import randomstring from 'randomstring';

export function genSecrect(): string {
    return randomstring.generate({
        length: 64,
        readable: true,
        charset: "alphanumeric",
        capitalization: "lowercase"
      });
}