using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class EmployeeFormView : System.Windows.Controls.UserControl
{
    public EmployeeFormView()
    {
        InitializeComponent();
    }

    public EmployeeFormView(EmployeeFormViewModel viewModel) : this()
    {
        DataContext = viewModel;
        Loaded += async (_, _) => await viewModel.InitializeCommand.ExecuteAsync(null);
    }
}