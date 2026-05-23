using System.Text.RegularExpressions;

namespace ERP.Application.Cadastros.Common;

public static class CpfCnpjHelper
{
    public static string SomenteDigitos(string value) =>
        Regex.Replace(value ?? string.Empty, @"\D", "");

    public static bool IsValidCpf(string value)
    {
        var d = SomenteDigitos(value);
        if (d.Length != 11) return false;
        if (d.Distinct().Count() == 1) return false;

        int sum = 0;
        for (int i = 0; i < 9; i++) sum += (d[i] - '0') * (10 - i);
        int r = sum % 11;
        int d1 = r < 2 ? 0 : 11 - r;
        if (d1 != d[9] - '0') return false;

        sum = 0;
        for (int i = 0; i < 10; i++) sum += (d[i] - '0') * (11 - i);
        r = sum % 11;
        int d2 = r < 2 ? 0 : 11 - r;
        return d2 == d[10] - '0';
    }

    public static bool IsValidCnpj(string value)
    {
        var d = SomenteDigitos(value);
        if (d.Length != 14) return false;
        if (d.Distinct().Count() == 1) return false;

        int[] w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        int[] w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        int sum = 0;
        for (int i = 0; i < 12; i++) sum += (d[i] - '0') * w1[i];
        int r = sum % 11;
        int d1 = r < 2 ? 0 : 11 - r;
        if (d1 != d[12] - '0') return false;

        sum = 0;
        for (int i = 0; i < 13; i++) sum += (d[i] - '0') * w2[i];
        r = sum % 11;
        int d2 = r < 2 ? 0 : 11 - r;
        return d2 == d[13] - '0';
    }
}
