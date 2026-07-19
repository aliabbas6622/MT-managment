using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class LicensingView : System.Windows.Controls.UserControl
{
    public LicensingView(LicensingViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}
